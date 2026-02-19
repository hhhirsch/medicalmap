import { FastifyInstance } from "fastify";
import { parseQueryParams, type CongressRow, type Facets, type FacetCount } from "@medicalmap/shared";
import { query } from "../db";

interface WhereClause {
  conditions: string[];
  params: unknown[];
}

function buildWhereClause(parsed: ReturnType<typeof parseQueryParams>): WhereClause {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (parsed.q) {
    conditions.push(
      `(c.name ILIKE $${idx} OR c.city ILIKE $${idx} OR c.tags::text ILIKE $${idx})`
    );
    params.push(`%${parsed.q}%`);
    idx++;
  }

  if (parsed.ind.length > 0) {
    conditions.push(`c.indication = ANY($${idx}::text[])`);
    params.push(parsed.ind);
    idx++;
  }

  if (parsed.tier.length > 0) {
    conditions.push(`c.tier = ANY($${idx}::int[])`);
    params.push(parsed.tier.map(Number));
    idx++;
  }

  if (parsed.region.length > 0) {
    conditions.push(`c.region = ANY($${idx}::text[])`);
    params.push(parsed.region);
    idx++;
  }

  if (parsed.country.length > 0) {
    conditions.push(`c.country = ANY($${idx}::text[])`);
    params.push(parsed.country);
    idx++;
  }

  if (parsed.month.length > 0) {
    conditions.push(`c.typical_month = ANY($${idx}::int[])`);
    params.push(parsed.month.map(Number));
    idx++;
  }

  return { conditions, params };
}

const ALLOWED_SORT_COLS: Record<string, string> = {
  name: "c.name",
  start_date: "c.start_date",
  tier: "c.tier",
};

export async function congressesRoutes(app: FastifyInstance) {
  app.get("/congresses", async (req, reply) => {
    const parsed = parseQueryParams(req.query as Record<string, string | undefined>);
    const { conditions, params } = buildWhereClause(parsed);

    const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sortCol = ALLOWED_SORT_COLS[parsed.sort] || "c.name";
    const sortDir = parsed.dir === "desc" ? "DESC" : "ASC";
    const offset = (parsed.page - 1) * parsed.pageSize;

    // Count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM congresses c ${whereSQL}`,
      params
    );
    const total = parseInt(countResult[0]?.count || "0", 10);

    // Items
    const itemParams = [...params, parsed.pageSize, offset];
    const items = await query<CongressRow>(
      `SELECT c.* FROM congresses c ${whereSQL} ORDER BY ${sortCol} ${sortDir} NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      itemParams
    );

    // Facets
    const baseWhere = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countryWhere = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")} AND c.country IS NOT NULL`
      : "WHERE c.country IS NOT NULL";
    const monthWhere = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")} AND c.typical_month IS NOT NULL`
      : "WHERE c.typical_month IS NOT NULL";

    const facets: Facets = {
      tier: [],
      region: [],
      country: [],
      month: [],
      ind: [],
    };

    const facetQueries = [
      { key: "tier" as const, sql: `SELECT c.tier::text as value, COUNT(*)::int as count FROM congresses c ${baseWhere} GROUP BY c.tier ORDER BY c.tier` },
      { key: "region" as const, sql: `SELECT c.region as value, COUNT(*)::int as count FROM congresses c ${baseWhere} GROUP BY c.region ORDER BY count DESC` },
      { key: "country" as const, sql: `SELECT c.country as value, COUNT(*)::int as count FROM congresses c ${countryWhere} GROUP BY c.country ORDER BY count DESC LIMIT 30` },
      { key: "month" as const, sql: `SELECT c.typical_month::text as value, COUNT(*)::int as count FROM congresses c ${monthWhere} GROUP BY c.typical_month ORDER BY c.typical_month` },
      { key: "ind" as const, sql: `SELECT c.indication as value, COUNT(*)::int as count FROM congresses c ${baseWhere} GROUP BY c.indication ORDER BY count DESC` },
    ];

    for (const fq of facetQueries) {
      try {
        const rows = await query<FacetCount>(fq.sql, params);
        facets[fq.key] = rows.filter((r) => r.value !== null);
      } catch {
        // Facet query failed, leave empty
      }
    }

    return reply.send({
      items,
      total,
      page: parsed.page,
      pageSize: parsed.pageSize,
      facets,
    });
  });
}
