/**
 * xlsx_to_json.ts — Convert "Data congress.xlsx" to apps/api/data/congresses.json
 *
 * Usage:
 *   tsx scripts/xlsx_to_json.ts [inputPath] [outputPath]
 *
 * Defaults:
 *   input:  apps/api/seed/Data congress.xlsx
 *   output: apps/api/data/congresses.json
 */

import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const DEFAULT_INPUT = path.join(__dirname, "..", "seed", "Data congress.xlsx");
const DEFAULT_OUTPUT = path.join(__dirname, "..", "data", "congresses.json");

const SHEET_NAME = "Sheet1";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CongressRecord {
  id: string;
  name: string;
  pillar: string;
  indication: string; // same as pillar, kept for API backward compatibility
  indication_detail: string | null;
  tier: number;
  region: string;
  scope: string;
  country: string | null;
  city: string | null;
  location_text: string | null;
  start_date: string | null;
  end_date: string | null;
  typical_month: number | null;
  website_url: string;
  deadlines_text: string | null;
  rationale: string | null;
  organizer: string | null;
  tags: string[];
  score: number;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GERMAN_MONTHS: Record<string, number> = {
  januar: 1,
  jan: 1,
  februar: 2,
  feb: 2,
  märz: 3,
  mär: 3,
  april: 4,
  apr: 4,
  mai: 5,
  juni: 6,
  jun: 6,
  juli: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  oktober: 10,
  okt: 10,
  november: 11,
  nov: 11,
  dezember: 12,
  dez: 12,
};

const COUNTRY_TO_REGION: Record<string, string> = {
  // North America
  usa: "NA",
  "u.s.a.": "NA",
  "united states": "NA",
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
  münchen: "EU",
  berlin: "EU",
  hamburg: "EU",
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

/** Slugify a string into a URL-safe identifier. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

    // Cross-month range like "28.09.–02.10.2026"
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
 */
function parseLocation(raw: string | null | undefined): {
  city: string | null;
  country: string | null;
} {
  if (!raw) return { city: null, country: null };

  const str = raw.trim();
  const yearMatch = str.match(/\d{4}:\s*(.+)/);
  if (!yearMatch) return { city: null, country: null };

  let locationPart = yearMatch[1].trim();
  locationPart = locationPart.replace(/\s*\([^)]+\)/, "").trim();

  if (!locationPart || locationPart === "?") {
    const parenthesisMatch = raw.match(/\(([^;)]+)/);
    if (parenthesisMatch) {
      const possibleCountry = parenthesisMatch[1].trim();
      return { city: null, country: possibleCountry || null };
    }
    return { city: null, country: null };
  }

  const parts = locationPart.split(",").map((p) => p.trim());
  if (parts.length === 1) {
    return { city: null, country: parts[0] };
  }

  const country = parts[parts.length - 1];
  const city = parts.slice(0, parts.length - 1).join(", ");
  return { city: city || null, country: country || null };
}

/** Map a country string to a region code. */
function deriveRegion(country: string | null): string {
  if (!country) return "International";
  const key = country.toLowerCase().trim();
  return COUNTRY_TO_REGION[key] ?? "International";
}

/** Split tags string "a; b; c" into ["a","b","c"]. */
function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Cell value to string or null. */
function cellStr(val: ExcelJS.CellValue): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && "richText" in val) {
    return (val as ExcelJS.CellRichTextValue).richText
      .map((r) => r.text)
      .join("");
  }
  if (typeof val === "object" && "text" in val) {
    return (val as ExcelJS.CellHyperlinkValue).text ?? null;
  }
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

/** Ensure website URL starts with http(s). */
function normalizeUrl(url: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const inputPath = process.argv[2] || DEFAULT_INPUT;
  const outputPath = process.argv[3] || DEFAULT_OUTPUT;

  console.log(`Reading: ${inputPath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);

  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    console.error(`Sheet "${SHEET_NAME}" not found in ${inputPath}`);
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

  const records: CongressRecord[] = [];
  const slugCounts: Record<string, number> = {};
  let skipped = 0;
  let duplicates = 0;
  const updatedAt = new Date().toISOString();

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);

    const name = cellStr(row.getCell(headers["Name"] ?? 0).value);
    if (!name) {
      skipped++;
      continue;
    }

    const pillar = cellStr(row.getCell(headers["Pillar"] ?? 0).value);
    if (!pillar) {
      console.warn(`Row ${rowNum}: skipping "${name}" — missing Pillar`);
      skipped++;
      continue;
    }

    const websiteRaw = cellStr(row.getCell(headers["Offizielle URL"] ?? 0).value);
    const website_url = normalizeUrl(websiteRaw);
    if (!website_url) {
      console.warn(`Row ${rowNum}: skipping "${name}" — no website URL`);
      skipped++;
      continue;
    }

    const organizer = cellStr(row.getCell(headers["Gesellschaft/Organisator"] ?? 0).value);
    const indication_detail = cellStr(row.getCell(headers["Indikation(en)"] ?? 0).value);
    const tierRaw = cellStr(row.getCell(headers["Tier"] ?? 0).value);
    const monthRaw = cellStr(row.getCell(headers["Typischer Monat(e)"] ?? 0).value);
    const ortRaw = cellStr(row.getCell(headers["Üblicher Ort"] ?? 0).value);
    const deadlines_text = cellStr(row.getCell(headers["Wichtige Deadlines (öffentlich)"] ?? 0).value);
    const rationale = cellStr(row.getCell(headers["Rationale"] ?? 0).value);
    const tagsRaw = cellStr(row.getCell(headers["Tags"] ?? 0).value);

    const tier = parseTier(tierRaw);
    const score = scoreFromTier(tier);
    const { typical_month, start_date, end_date } = parseMonthField(monthRaw);
    const { city, country } = parseLocation(ortRaw);
    const region = deriveRegion(country);
    const tags = parseTags(tagsRaw);
    const location_text = ortRaw;

    // Generate stable slug-based ID
    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = `congress-${rowNum}`;

    const count = slugCounts[baseSlug] ?? 0;
    if (count > 0) duplicates++;
    slugCounts[baseSlug] = count + 1;
    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    records.push({
      id,
      name,
      pillar,
      indication: pillar, // backward compat alias
      indication_detail,
      tier,
      region,
      scope: "International",
      country,
      city,
      location_text,
      start_date,
      end_date,
      typical_month,
      website_url,
      deadlines_text,
      rationale,
      organizer,
      tags,
      score,
      updated_at: updatedAt,
    });
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), "utf-8");

  console.log(`Written: ${outputPath}`);
  console.log(`Records: ${records.length}, Skipped: ${skipped}, Duplicate slugs handled: ${duplicates}`);
}

main().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
