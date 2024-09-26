import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClerkClient, verifyToken } from "@clerk/backend";
import type { User } from "@clerk/backend";

type Bindings = {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_PUBLIC_KEY: string;
};

// Extend the Hono context to include our user
declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.use("*", async (c, next) => {
  const clerkClient = createClerkClient({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
  });

  const { isSignedIn } = await clerkClient.authenticateRequest(c.req.raw, {
    jwtKey: c.env.CLERK_PUBLIC_KEY,
  });

  if (!isSignedIn) {
    return c.json({}, 401);
  }

  // Get the user information from clerk
  const token = c.req.raw.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return c.json({}, 401);
  }
  const sessionClaims = await verifyToken(token, {
    jwtKey: c.env.CLERK_PUBLIC_KEY,
  });

  if (!sessionClaims) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const userId = sessionClaims.sub;
  const user = await clerkClient.users.getUser(userId);

  c.set("user", user);

  await next();
});

app.get("/api/session", async (c) => {
  const user = c.get("user");

  const query = "SELECT * FROM users WHERE username = ?";
  const params = [user.id];

  const db = c.env.DB.prepare(query).bind(...params);
  let query_results = await db.all();

  if (query_results.results.length === 0) {
    const insertQuery =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const insertParams = [user.id, user.emailAddresses[0].emailAddress, ""];
    const insertDb = c.env.DB.prepare(insertQuery).bind(...insertParams);

    try {
      await insertDb.run();
      query_results = await db.all();
    } catch (error) {
      console.error("Error creating user:", error);
      return c.json({ message: "Error creating user" }, 500);
    }
  }

  const user_data = query_results.results[0];

  return c.json({
    email: user_data.email,
  });
});

export default app;
