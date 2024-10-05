import { Context, Next } from "hono";
import type { Bindings } from "../types/bindings";
import { getCookie } from "hono/cookie";

export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  // Get the session token from the session cookie
  const sessionToken = getCookie(c, "session");

  if (!sessionToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    let userData = await c.env.KV.get(sessionToken, { type: "json" });

    if (!userData) {
      return c.json({ error: "Authentication failed" }, 401);
    }
    // Set the user data in the context
    c.set("userData", { ...userData, sessionToken });

    await next();
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
}
