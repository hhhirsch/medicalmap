import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { pool } from "../src/db";

async function importCongresses() {
  const csvPath = process.argv[2] || path.join(__dirname, "..", "seed", "congresses.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records to import`);

  for (const rec of records) {
    const tags = rec.tags ? JSON.stringify(rec.tags.split(";").map((s: string) => s.trim())) : null;

    await pool.query(
      `INSERT INTO congresses (name, indication, tier, region, scope, country, city, start_date, end_date, typical_month, website_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT DO NOTHING`,
      [
        rec.name,
        rec.indication,
        parseInt(rec.tier, 10),
        rec.region,
        rec.scope,
        rec.country || null,
        rec.city || null,
        rec.start_date || null,
        rec.end_date || null,
        rec.typical_month ? parseInt(rec.typical_month, 10) : null,
        rec.website_url,
        tags,
      ]
    );
  }

  await pool.end();
  console.log("Import complete.");
}

importCongresses().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
