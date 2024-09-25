import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClerkClient, verifyToken } from "@clerk/backend";
import type { User } from "@clerk/backend"; // Assuming User is the correct type to use

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

// Middleware can do something to the request.
// https://hono.dev/docs/guides/middleware
// https://hono.dev/docs/middleware/builtin/cors
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

  const db = params
    ? c.env.DB.prepare(query).bind(...params)
    : c.env.DB.prepare(query);
  const query_results = await db.all();

  if (query_results.results.length === 0) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json({
    name: user.id,
    query: query_results.results,
  });
});

app.post("/api/session", async (c) => {
  const user = c.get("user");

  // Check if the user already exists
  const checkQuery = "SELECT * FROM users WHERE username = ?";
  const checkParams = [user.id];
  const checkDb = c.env.DB.prepare(checkQuery).bind(...checkParams);
  const checkResults = await checkDb.all();

  if (checkResults.results.length > 0) {
    return c.json({ message: "User already exists" }, 409);
  }

  // Insert new user
  const insertQuery =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  const insertParams = [user.id, user.emailAddresses[0].emailAddress, ""];
  const insertDb = c.env.DB.prepare(insertQuery).bind(...insertParams);

  try {
    await insertDb.run();
    return c.json({ message: "User created successfully" }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ message: "Error creating user" }, 500);
  }
});

export default app;
