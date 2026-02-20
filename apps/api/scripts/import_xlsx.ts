/**
 * import_xlsx.ts — Import "Data congress.xlsx" into the congresses table.
 *
 * Usage:
 *   tsx scripts/import_xlsx.ts [path/to/file.xlsx]
 *
 * Defaults to apps/api/seed/Data congress.xlsx when no path is given.
 */

import path from "path";
import ExcelJS from "exceljs";
import { pool } from "../src/db";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_FILE = path.join(__dirname, "..", "seed", "Data congress.xlsx");
const SHEET_NAME = "Sheet1";

const GERMAN_MONTHS: Record<string, number> = {
  januar: 1,
  februar: 2,
  märz: 3,
  april: 4,
  mai: 5,
  juni: 6,
  juli: 7,
  august: 8,
  september: 9,
  oktober: 10,
  november: 11,
  dezember: 12,
};

// Map country keywords (German names used in the data) to API regions.
const COUNTRY_TO_REGION: Record<string, string> = {
  // North America
  usa: "NA",
  kanada: "NA",
  canada: "NA",
  // Europe
  deutschland: "EU",
  germany: "EU",
  italien: "EU",
  italy: "EU",
  frankreich: "EU",
  france: "EU",
  niederlande: "EU",
  netherlands: "EU",
  spanien: "EU",
  spain: "EU",
  schweiz: "EU",
  switzerland: "EU",
  österreich: "EU",
  austria: "EU",
  belgien: "EU",
  belgium: "EU",
  uk: "EU",
  "vereinigtes königreich": "EU",
  "united kingdom": "EU",
  dänemark: "EU",
  denmark: "EU",
  schweden: "EU",
  sweden: "EU",
  norwegen: "EU",
  norway: "EU",
  portugal: "EU",
  griechenland: "EU",
  greece: "EU",
  tschechien: "EU",
  "czech republic": "EU",
  ungarn: "EU",
  hungary: "EU",
  türkei: "EU",
  turkey: "EU",
  // Asia-Pacific
  japan: "APAC",
  china: "APAC",
  australien: "APAC",
  australia: "APAC",
  singapur: "APAC",
  singapore: "APAC",
  korea: "APAC",
  indien: "APAC",
  india: "APAC",
  // Latin America
  mexiko: "LATAM",
  mexico: "LATAM",
  brasilien: "LATAM",
  brazil: "LATAM",
  argentinien: "LATAM",
  argentina: "LATAM",
  // MEA
  südafrika: "MEA",
  "south africa": "MEA",
  vae: "MEA",
  uae: "MEA",
  dubai: "MEA",
  israel: "MEA",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "Tier-1" / "Tier-2" / "Tier-3" to an integer 1–3. */
function parseTier(raw: string | null | undefined): number {
  if (!raw) return 2;
  const m = String(raw).match(/(\d)/);
  const n = m ? parseInt(m[1], 10) : 2;
  return n >= 1 && n <= 3 ? n : 2;
}

/** Derive score from tier. */
function scoreFromTier(tier: number): number {
  if (tier === 1) return 90;
  if (tier === 2) return 75;
  return 60;
}

/** Parse German month name to a month number 1–12 (returns null if unknown). */
function parseGermanMonth(raw: string): number | null {
  const lower = raw.toLowerCase().trim();
  for (const [name, num] of Object.entries(GERMAN_MONTHS)) {
    if (lower.startsWith(name)) return num;
  }
  return null;
}

/**
 * Parse "Typischer Monat(e)" like:
 *   "Juni (05–08.06.2026)"
 *   "September–Oktober (28.09.–02.10.2026)"
 *   "Februar–März (27.02.–02.03.2026)"
 *   "März (03.03.2026)"
 *   "unbekannt"
 *
 * Returns { typical_month, start_date, end_date }.
 */
function parseMonthField(raw: string | null | undefined): {
  typical_month: number | null;
  start_date: string | null;
  end_date: string | null;
} {
  if (!raw || raw.trim().toLowerCase() === "unbekannt") {
    return { typical_month: null, start_date: null, end_date: null };
  }

  const str = raw.trim();
  let typical_month: number | null = null;
  let start_date: string | null = null;
  let end_date: string | null = null;

  // Extract the German month name before any parenthesis or dash
  const monthPart = str.split(/[\s(–-]/)[0];
  typical_month = parseGermanMonth(monthPart);

  // Extract content inside parentheses
  const parenMatch = str.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inner = parenMatch[1].trim();

    // Single date like "03.03.2026"
    const singleDate = inner.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (singleDate) {
      const [, dd, mm, yyyy] = singleDate;
      start_date = `${yyyy}-${mm}-${dd}`;
      typical_month = typical_month ?? parseInt(mm, 10);
      return { typical_month, start_date, end_date };
    }

    // Range like "05–08.06.2026" (same month)
    const sameMonthRange = inner.match(
      /^(\d{2})[–-](\d{2})\.(\d{2})\.(\d{4})$/
    );
    if (sameMonthRange) {
      const [, dd1, dd2, mm, yyyy] = sameMonthRange;
      start_date = `${yyyy}-${mm}-${dd1}`;
      end_date = `${yyyy}-${mm}-${dd2}`;
      typical_month = typical_month ?? parseInt(mm, 10);
      return { typical_month, start_date, end_date };
    }

    // Cross-month range like "28.09.–02.10.2026" or "27.02.–02.03.2026"
    const crossMonthRange = inner.match(
      /^(\d{2})\.(\d{2})\.[–-](\d{2})\.(\d{2})\.(\d{4})$/
    );
    if (crossMonthRange) {
      const [, dd1, mm1, dd2, mm2, yyyy] = crossMonthRange;
      start_date = `${yyyy}-${mm1}-${dd1}`;
      end_date = `${yyyy}-${mm2}-${dd2}`;
      typical_month = typical_month ?? parseInt(mm1, 10);
      return { typical_month, start_date, end_date };
    }
  }

  return { typical_month, start_date, end_date };
}

/**
 * Parse "Üblicher Ort" like:
 *   "2026: New Orleans, USA"
 *   "2026: Washington, DC, USA"
 *   "Hybrid; 2026: Prag, Tschechien"
 *   "2026: ? (Deutschland; siehe Website)"
 *
 * Returns { city, country }.
 */
function parseLocation(raw: string | null | undefined): {
  city: string | null;
  country: string | null;
} {
  if (!raw) return { city: null, country: null };

  const str = raw.trim();
  // Try to find the part after "YYYY:"
  const yearMatch = str.match(/\d{4}:\s*(.+)/);
  if (!yearMatch) return { city: null, country: null };

  let locationPart = yearMatch[1].trim();

  // Strip parenthetical notes like "(Deutschland; siehe Website)"
  locationPart = locationPart.replace(/\s*\([^)]+\)/, "").trim();

  // If it looks like "?" or is empty after stripping
  if (!locationPart || locationPart === "?") {
    // Try to extract country from the original via parentheses
    const parenthesisMatch = raw.match(/\(([^;)]+)/);
    if (parenthesisMatch) {
      const possibleCountry = parenthesisMatch[1].trim();
      return { city: null, country: possibleCountry || null };
    }
    return { city: null, country: null };
  }

  // Split by comma — last token is country, rest is city
  const parts = locationPart.split(",").map((p) => p.trim());
  if (parts.length === 1) {
    // Only a country / city with no comma
    return { city: null, country: parts[0] };
  }

  const country = parts[parts.length - 1];
  const city = parts.slice(0, parts.length - 1).join(", ");
  return { city: city || null, country: country || null };
}

/** Map a country string (German or English) to one of EU/NA/APAC/LATAM/MEA. */
function deriveRegion(country: string | null): string {
  if (!country) return "EU"; // safe default within allowed CHECK constraint values
  const key = country.toLowerCase().trim();
  return COUNTRY_TO_REGION[key] ?? "EU"; // default EU for unknown European countries
}

/** Split tags string "a; b; c" into ["a","b","c"]. */
function parseTags(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  const parts = String(raw)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

/** Cell value to string or null. */
function cellStr(val: ExcelJS.CellValue): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "richText" in val) {
    // RichText
    return (val as ExcelJS.CellRichTextValue).richText
      .map((r) => r.text)
      .join("");
  }
  if (typeof val === "object" && "text" in val) {
    // Hyperlink
    return (val as ExcelJS.CellHyperlinkValue).text ?? null;
  }
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const filePath = process.argv[2] || DEFAULT_FILE;
  console.log(`Reading: ${filePath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    console.error(`Sheet "${SHEET_NAME}" not found in ${filePath}`);
    process.exit(1);
  }

  // Build header → column-number map from row 1
  const headers: Record<string, number> = {};
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNum) => {
    const h = cellStr(cell.value);
    if (h) headers[h] = colNum;
  });

  const required = ["Pillar", "Name", "Tier", "Offizielle URL"];
  for (const h of required) {
    if (!headers[h]) {
      console.error(`Missing required column "${h}" in ${SHEET_NAME}`);
      process.exit(1);
    }
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);

    const name = cellStr(row.getCell(headers["Name"] ?? 0).value);
    if (!name) {
      skipped++;
      continue;
    }

    const indicationRaw = cellStr(row.getCell(headers["Pillar"] ?? 0).value);
    if (!indicationRaw) {
      console.warn(`Row ${rowNum}: skipping "${name}" — missing Pillar (indication)`);
      skipped++;
      continue;
    }
    const indication = indicationRaw;
    const organizer = cellStr(row.getCell(headers["Gesellschaft/Organisator"] ?? 0).value);
    const indication_detail = cellStr(row.getCell(headers["Indikation(en)"] ?? 0).value);
    const tierRaw = cellStr(row.getCell(headers["Tier"] ?? 0).value);
    const monthRaw = cellStr(row.getCell(headers["Typischer Monat(e)"] ?? 0).value);
    const ortRaw = cellStr(row.getCell(headers["Üblicher Ort"] ?? 0).value);
    const website_url = cellStr(row.getCell(headers["Offizielle URL"] ?? 0).value);
    const deadlines_text = cellStr(row.getCell(headers["Wichtige Deadlines (öffentlich)"] ?? 0).value);
    const rationale = cellStr(row.getCell(headers["Rationale"] ?? 0).value);
    const tagsRaw = cellStr(row.getCell(headers["Tags"] ?? 0).value);

    if (!website_url) {
      console.warn(`Row ${rowNum}: skipping "${name}" — no website_url`);
      skipped++;
      continue;
    }

    const tier = parseTier(tierRaw);
    const score = scoreFromTier(tier);
    const { typical_month, start_date, end_date } = parseMonthField(monthRaw);
    const { city, country } = parseLocation(ortRaw);
    const region = deriveRegion(country);
    const tags = parseTags(tagsRaw);
    const location_text = ortRaw;

    try {
      const result = await pool.query<{ id: string; inserted: boolean }>(
        `INSERT INTO congresses
           (name, indication, indication_detail, organizer,
            tier, score,
            region, scope, country, city,
            start_date, end_date, typical_month,
            website_url, location_text, deadlines_text, rationale, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (website_url) WHERE website_url IS NOT NULL
         DO UPDATE SET
           name              = EXCLUDED.name,
           indication        = EXCLUDED.indication,
           indication_detail = EXCLUDED.indication_detail,
           organizer         = EXCLUDED.organizer,
           tier              = EXCLUDED.tier,
           score             = EXCLUDED.score,
           region            = EXCLUDED.region,
           scope             = EXCLUDED.scope,
           country           = EXCLUDED.country,
           city              = EXCLUDED.city,
           start_date        = EXCLUDED.start_date,
           end_date          = EXCLUDED.end_date,
           typical_month     = EXCLUDED.typical_month,
           location_text     = EXCLUDED.location_text,
           deadlines_text    = EXCLUDED.deadlines_text,
           rationale         = EXCLUDED.rationale,
           tags              = EXCLUDED.tags,
           updated_at        = now()
         RETURNING id, (xmax = 0) AS inserted`,
        [
          name,
          indication,
          indication_detail,
          organizer,
          tier,
          score,
          region,
          "International",
          country,
          city,
          start_date,
          end_date,
          typical_month,
          website_url,
          location_text,
          deadlines_text,
          rationale,
          tags ? JSON.stringify(tags) : null,
        ]
      );
      if (result.rows[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err) {
      console.error(`Row ${rowNum} "${name}": ${(err as Error).message}`);
      skipped++;
    }
  }

  await pool.end();
  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
