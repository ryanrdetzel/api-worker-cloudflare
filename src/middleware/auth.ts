import { Context, Next } from "hono";
import { createClerkClient, verifyToken } from "@clerk/backend";
import type { Bindings } from "../types/bindings";
import { getUserData } from "../services/db";

export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const clerkClient = createClerkClient({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
  });

  const { isSignedIn } = await clerkClient.authenticateRequest(c.req.raw, {
    jwtKey: c.env.CLERK_PUBLIC_KEY,
  });

  if (!isSignedIn) {
    console.error("User is not signed in to clerk");
    return c.json({}, 401);
  }

  const token = c.req.raw.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    console.error("No token found in authorization header");
    return c.json({}, 401);
  }

  const sessionClaims = await verifyToken(token, {
    jwtKey: c.env.CLERK_PUBLIC_KEY,
  });

  if (!sessionClaims) {
    console.error("Invalid token");
    return c.json({ error: "Invalid token" }, 401);
  }

  const userId = sessionClaims.sub;
  const user = await clerkClient.users.getUser(userId);
  const userData = await getUserData(c.env.DB, user.id);

  c.set("user", user);
  c.set("userData", userData);

  await next();
}
