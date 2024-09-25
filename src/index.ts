import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  SECRET_KEY: string;
};

// Extend the Hono context to include our user
declare module "hono" {
  interface ContextVariableMap {
    user: string;
  }
}

const app = new Hono<{ Bindings: Bindings }>();

// Middleware can do something to the request.
// https://hono.dev/docs/guides/middleware
// https://hono.dev/docs/middleware/builtin/cors
app.use("*", cors());

app.use("*", async (c, next) => {
  c.set("user", "Hono"); // Example how to add to the context
  await next();
});

app.get("/api", async (c) => {
  /* This is a example of how to use env and secrets */
  const SECRET_KEY = c.env.SECRET_KEY;

  /* Example of how to use the D1 database */
  const query = "SELECT * FROM users WHERE username = ?";
  const params = ["Bob"];
  const db = params
    ? c.env.DB.prepare(query).bind(...params)
    : c.env.DB.prepare(query);
  const query_results = await db.all();

  return c.json({
    name: c.get("user"),
    secret: SECRET_KEY,
    query: query_results.results,
  });
});

export default app;
