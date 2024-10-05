import { Hono } from "hono";
import type { Bindings } from "../types/bindings";

const sessionRoutes = new Hono<{ Bindings: Bindings }>();

sessionRoutes.get("/session", async (c) => {
  let userData = c.get("userData");

  if (!userData || userData.email === "") {
    return c.json({ error: "Authentication failed" }, 401);
  }

  return c.json({
    email: userData.email,
  });
});

export { sessionRoutes };
