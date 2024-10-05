import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { sessionRoutes } from "./routes/session";
import type { Bindings } from "./types/bindings";
import { authRoutes } from "./routes/auth";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());
app.use("/api/*", authMiddleware);
app.use("/auth/logout", authMiddleware);

app.route("/auth", authRoutes);
app.route("/api", sessionRoutes);

export const cronExample = async (env: Bindings) => {};

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(cronExample(env));
  },
};
