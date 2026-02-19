import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import { healthRoutes } from "./routes/health";
import { congressesRoutes } from "./routes/congresses";
import { exportsRoutes } from "./routes/exports";

dotenv.config();

async function main() {
  const app = Fastify({ logger: true });

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim());

  await app.register(cors, {
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.register(rateLimit, {
    global: false,
  });

  await app.register(healthRoutes);
  await app.register(congressesRoutes, { prefix: "/v1" });
  await app.register(exportsRoutes, { prefix: "/v1" });

  const port = parseInt(process.env.PORT || "4000", 10);
  const host = process.env.HOST || "0.0.0.0";

  await app.listen({ port, host });
  console.log(`API listening on ${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
