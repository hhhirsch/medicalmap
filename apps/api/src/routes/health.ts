import { FastifyInstance } from "fastify";
import { getAll } from "../data/congressStore";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    try {
      const count = getAll().length;
      return reply.send({ status: "ok", congresses: count });
    } catch {
      return reply.status(503).send({ status: "error", message: "Data unavailable" });
    }
  });
}
