import { FastifyInstance } from "fastify";
import { parseQueryParams, type Facets, type FacetCount } from "@medicalmap/shared";
import { getAll, applyFilters, type FilterParams } from "../data/congressStore";

export async function congressesRoutes(app: FastifyInstance) {
  app.get("/congresses", async (req, reply) => {
    const parsed = parseQueryParams(req.query as Record<string, string | undefined>);

    const filterParams: FilterParams = {
      q: parsed.q,
      ind: parsed.ind,
      tier: parsed.tier,
      region: parsed.region,
      country: parsed.country,
      month: parsed.month,
      sort: parsed.sort,
      dir: parsed.dir,
    };

    const all = getAll();
    const filtered = applyFilters(all, filterParams);
    const total = filtered.length;

    // Pagination
    const pageSize = Math.min(parsed.pageSize, 200);
    const page = parsed.page;
    const offset = (page - 1) * pageSize;
    const items = filtered.slice(offset, offset + pageSize);

    // Facets — computed from the filtered set
    const facets: Facets = {
      tier: countFacet(filtered, (c) => c.tier != null ? String(c.tier) : null, (a, b) => Number(a.value) - Number(b.value)),
      region: countFacet(filtered, (c) => c.region ?? null),
      country: countFacet(filtered, (c) => c.country ?? null, undefined, 30),
      month: countFacet(filtered, (c) => c.typical_month != null ? String(c.typical_month) : null, (a, b) => Number(a.value) - Number(b.value)),
      ind: countFacet(filtered, (c) => c.indication ?? null),
    };

    return reply.send({
      items,
      total,
      page,
      pageSize,
      facets,
    });
  });
}

/** Build facet counts from an array of records. */
function countFacet(
  records: ReturnType<typeof getAll>,
  getValue: (c: ReturnType<typeof getAll>[number]) => string | null,
  sort?: (a: FacetCount, b: FacetCount) => number,
  limit?: number
): FacetCount[] {
  const counts = new Map<string, number>();
  for (const c of records) {
    const val = getValue(c);
    if (val === null || val === undefined) continue;
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }

  let result: FacetCount[] = Array.from(counts.entries()).map(([value, count]) => ({ value, count }));

  if (sort) {
    result.sort(sort);
  } else {
    result.sort((a, b) => b.count - a.count);
  }

  if (limit !== undefined) {
    result = result.slice(0, limit);
  }

  return result;
}
