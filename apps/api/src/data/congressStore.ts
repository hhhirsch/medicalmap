/**
 * congressStore.ts — In-memory store loaded from congresses.json.
 *
 * The JSON is read once at module load time and cached.
 * Use getAll() to retrieve all records and filterAndSort() for query operations.
 */

import path from "path";
import fs from "fs";
import { type CongressRow } from "@medicalmap/shared";

const DATA_PATH = path.join(__dirname, "..", "..", "data", "congresses.json");

// Load once at startup
let _records: CongressRow[] | null = null;

function load(): CongressRow[] {
  if (_records) return _records;
  let raw: string;
  try {
    raw = fs.readFileSync(DATA_PATH, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to read congress data file at ${DATA_PATH}: ${(err as Error).message}. ` +
      `Run "pnpm --filter @medicalmap/api xlsx-to-json" to generate it.`
    );
  }
  try {
    _records = JSON.parse(raw) as CongressRow[];
  } catch (err) {
    throw new Error(`Failed to parse congress data file at ${DATA_PATH}: ${(err as Error).message}`);
  }
  return _records;
}

export function getAll(): CongressRow[] {
  return load();
}

export interface FilterParams {
  q: string | null;
  ind: string[];
  tier: string[];
  region: string[];
  country: string[];
  month: string[];
  sort: string;
  dir: string;
}

/** Apply filters to records (no pagination). Used by both GET /congresses and POST /exports. */
export function applyFilters(records: CongressRow[], params: FilterParams): CongressRow[] {
  let result = records;

  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.organizer && c.organizer.toLowerCase().includes(q)) ||
        (c.location_text && c.location_text.toLowerCase().includes(q)) ||
        (Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }

  if (params.ind.length > 0) {
    const inds = params.ind.map((s) => s.toLowerCase());
    result = result.filter((c) => {
      const indLower = c.indication ? c.indication.toLowerCase() : "";
      const detailLower = c.indication_detail ? c.indication_detail.toLowerCase() : "";
      return inds.some((i) => indLower.includes(i) || detailLower.includes(i));
    });
  }

  if (params.tier.length > 0) {
    const tiers = params.tier.map(Number);
    result = result.filter((c) => tiers.includes(c.tier));
  }

  if (params.region.length > 0) {
    const regions = params.region.map((s) => s.toLowerCase());
    result = result.filter((c) => c.region && regions.includes(c.region.toLowerCase()));
  }

  if (params.country.length > 0) {
    const countries = params.country.map((s) => s.toLowerCase());
    result = result.filter((c) => c.country && countries.includes(c.country.toLowerCase()));
  }

  if (params.month.length > 0) {
    const months = params.month.map(Number);
    result = result.filter((c) => c.typical_month !== null && months.includes(c.typical_month));
  }

  return sortRecords(result, params.sort, params.dir);
}

function sortRecords(records: CongressRow[], sort: string, dir: string): CongressRow[] {
  const asc = dir !== "desc";
  return [...records].sort((a, b) => {
    let valA: string | number | null = null;
    let valB: string | number | null = null;

    if (sort === "start_date") {
      valA = a.start_date ?? null;
      valB = b.start_date ?? null;
    } else if (sort === "tier") {
      valA = a.tier;
      valB = b.tier;
    } else if (sort === "score") {
      valA = (a as CongressRow & { score?: number | null }).score ?? null;
      valB = (b as CongressRow & { score?: number | null }).score ?? null;
    } else {
      // default: name
      valA = a.name;
      valB = b.name;
    }

    // Null-safe: nulls go last
    if (valA === null && valB === null) return 0;
    if (valA === null) return 1;
    if (valB === null) return -1;

    if (typeof valA === "number" && typeof valB === "number") {
      return asc ? valA - valB : valB - valA;
    }

    const strA = String(valA);
    const strB = String(valB);
    const cmp = strA.localeCompare(strB);
    return asc ? cmp : -cmp;
  });
}
