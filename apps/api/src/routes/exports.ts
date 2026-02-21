import { FastifyInstance } from "fastify";
import { ExportRequestSchema, parseQueryParams } from "@medicalmap/shared";
import { getAll, applyFilters, type FilterParams } from "../data/congressStore";
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

      const { email, filters, exportType, consentExport: _consentExport, consentMarketing: _consentMarketing, _hp } = parsed.data;

      // Honeypot check
      if (_hp) {
        return reply.send({ success: true, message: "Export will be delivered by email." });
      }

      // Check required env vars
      if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
        return reply.status(500).send({ error: "Export service not configured. Missing RESEND_API_KEY or FROM_EMAIL." });
      }

      try {
        // Build filter params using same logic as GET
        const qp = {
          ...filters,
          q: filters.q ?? undefined,
          page: "1",
          pageSize: "10000",
        };
        const parsedQ = parseQueryParams(qp as Record<string, string | string[] | undefined>);

        const filterParams: FilterParams = {
          q: parsedQ.q,
          ind: parsedQ.ind,
          tier: parsedQ.tier,
          region: parsedQ.region,
          country: parsedQ.country,
          month: parsedQ.month,
          sort: parsedQ.sort,
          dir: parsedQ.dir,
        };

        const all = getAll();
        const rows = applyFilters(all, filterParams);

        // Generate export file
        const { buffer, contentType, filename } = await buildExportAsync(
          rows as Record<string, unknown>[],
          exportType
        );

        // Send email to user
        await sendExportEmail(email, buffer, contentType, filename);

        // Send internal notification
        await sendLeadNotification(email, filters as Record<string, unknown>, exportType);

        return reply.send({ success: true, message: "Export will be delivered by email." });
      } catch (err) {
        console.error("Export error:", (err as Error).message);
        return reply.status(500).send({ error: "Export failed. Please try again." });
      }
    }
  );
}
