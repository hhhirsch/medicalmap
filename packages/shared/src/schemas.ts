import { z } from "zod";

export const CongressRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  indication: z.string(),
  tier: z.number().int().min(1).max(3),
  region: z.string(),
  scope: z.string(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  typical_month: z.number().int().min(1).max(12).nullable(),
  website_url: z.string().url(),
  tags: z.array(z.string()).nullable(),
  updated_at: z.string(),
});

export type CongressRow = z.infer<typeof CongressRowSchema>;

export const FacetCountSchema = z.object({
  value: z.string(),
  count: z.number().int(),
});

export type FacetCount = z.infer<typeof FacetCountSchema>;

export const FacetsSchema = z.object({
  tier: z.array(FacetCountSchema),
  region: z.array(FacetCountSchema),
  country: z.array(FacetCountSchema),
  month: z.array(FacetCountSchema),
  ind: z.array(FacetCountSchema),
});

export type Facets = z.infer<typeof FacetsSchema>;

export const CongressesResponseSchema = z.object({
  items: z.array(CongressRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  facets: FacetsSchema,
});

export type CongressesResponse = z.infer<typeof CongressesResponseSchema>;

export const ExportRequestSchema = z.object({
  email: z.string().email(),
  filters: z.object({
    q: z.string().nullable().optional(),
    ind: z.array(z.string()).optional().default([]),
    tier: z.array(z.string()).optional().default([]),
    region: z.array(z.string()).optional().default([]),
    country: z.array(z.string()).optional().default([]),
    month: z.array(z.string()).optional().default([]),
    sort: z.string().optional().default("name"),
    dir: z.string().optional().default("asc"),
  }),
  exportType: z.enum(["csv", "xlsx"]),
  consentExport: z.literal(true, {
    errorMap: () => ({ message: "Export consent is required" }),
  }),
  consentMarketing: z.boolean().optional().default(false),
  _hp: z.string().max(0).optional(),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

export const ExportFilters = z.object({
  q: z.string().nullable().optional(),
  ind: z.array(z.string()).optional().default([]),
  tier: z.array(z.string()).optional().default([]),
  region: z.array(z.string()).optional().default([]),
  country: z.array(z.string()).optional().default([]),
  month: z.array(z.string()).optional().default([]),
  sort: z.string().optional().default("name"),
  dir: z.string().optional().default("asc"),
});

export type ExportFiltersType = z.infer<typeof ExportFilters>;
