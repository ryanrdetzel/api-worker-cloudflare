import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { sessionRoutes } from "./routes/session";
import type { Bindings } from "./types/bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());
app.use("*", authMiddleware);

app.route("/api", sessionRoutes);

export default app;
