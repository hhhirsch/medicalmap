import { FastifyInstance } from "fastify";
import { ExportRequestSchema, parseQueryParams } from "@medicalmap/shared";
import { query, queryOne } from "../db";
import { sendExportEmail, sendLeadNotification } from "../services/email";
import { buildExportAsync } from "../services/export-builder";

export async function exportsRoutes(app: FastifyInstance) {
  app.post(
    "/exports",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },
    },
    async (req, reply) => {
      // Validate body
      const parsed = ExportRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Validation failed", details: parsed.error.flatten() });
      }

      const { email, filters, exportType, consentExport, consentMarketing, _hp } = parsed.data;

      // Honeypot check
      if (_hp) {
        // Silently accept but do nothing
        return reply.send({ success: true, message: "Export will be delivered by email." });
      }

      try {
        // Upsert lead
        const lead = await queryOne<{ id: string }>(
          `INSERT INTO leads (email, consent_export, consent_marketing, source)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO UPDATE SET
             consent_export = EXCLUDED.consent_export,
             consent_marketing = EXCLUDED.consent_marketing
           RETURNING id`,
          [email, consentExport, consentMarketing, JSON.stringify({ type: "export", exportType })]
        );

        if (!lead) {
          return reply.status(500).send({ error: "Failed to create lead" });
        }

        // Store export request
        const exportReq = await queryOne<{ id: string }>(
          `INSERT INTO export_requests (lead_id, filters, export_type, status)
           VALUES ($1, $2, $3, 'pending')
           RETURNING id`,
          [lead.id, JSON.stringify(filters), exportType]
        );

        if (!exportReq) {
          return reply.status(500).send({ error: "Failed to create export request" });
        }

        // Build query using same logic as GET
        const qp = {
          ...filters,
          q: filters.q ?? undefined,
          page: "1",
          pageSize: "10000",
        };
        const parsedQ = parseQueryParams(qp as Record<string, string | string[] | undefined>);

        // Build WHERE clause (same logic as congresses route)
        const conditions: string[] = [];
        const params: unknown[] = [];
        let idx = 1;

        if (parsedQ.q) {
          conditions.push(`(c.name ILIKE $${idx} OR c.city ILIKE $${idx} OR c.tags::text ILIKE $${idx})`);
          params.push(`%${parsedQ.q}%`);
          idx++;
        }
        if (parsedQ.ind.length > 0) {
          conditions.push(`c.indication = ANY($${idx}::text[])`);
          params.push(parsedQ.ind);
          idx++;
        }
        if (parsedQ.tier.length > 0) {
          conditions.push(`c.tier = ANY($${idx}::int[])`);
          params.push(parsedQ.tier.map(Number));
          idx++;
        }
        if (parsedQ.region.length > 0) {
          conditions.push(`c.region = ANY($${idx}::text[])`);
          params.push(parsedQ.region);
          idx++;
        }
        if (parsedQ.country.length > 0) {
          conditions.push(`c.country = ANY($${idx}::text[])`);
          params.push(parsedQ.country);
          idx++;
        }
        if (parsedQ.month.length > 0) {
          conditions.push(`c.typical_month = ANY($${idx}::int[])`);
          params.push(parsedQ.month.map(Number));
          idx++;
        }

        const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sortCol = parsedQ.sort === "start_date" ? "c.start_date" : parsedQ.sort === "tier" ? "c.tier" : "c.name";
        const sortDir = parsedQ.dir === "desc" ? "DESC" : "ASC";

        const rows = await query<Record<string, unknown>>(
          `SELECT c.* FROM congresses c ${whereSQL} ORDER BY ${sortCol} ${sortDir} NULLS LAST`,
          params
        );

        // Generate export file
        const { buffer, contentType, filename } = await buildExportAsync(rows, exportType);

        // Send email to user
        await sendExportEmail(email, buffer, contentType, filename);

        // Send internal notification
        await sendLeadNotification(email, filters, exportType);

        // Update export request status
        await query(
          `UPDATE export_requests SET status = 'sent' WHERE id = $1`,
          [exportReq.id]
        );

        return reply.send({ success: true, message: "Export will be delivered by email." });
      } catch (err) {
        console.error("Export error:", (err as Error).message);
        return reply.status(500).send({ error: "Export failed. Please try again." });
      }
    }
  );
}
