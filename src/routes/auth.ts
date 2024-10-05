import { Hono } from "hono";
import type { Bindings, UserData } from "../types/bindings";
import { setCookie } from "hono/cookie";
import { authenticateUser, registerUser } from "../services/db";

const authRoutes = new Hono<{ Bindings: Bindings }>();

/*
POST Logout
*/
authRoutes.post("/logout", async (c) => {
  let userData = c.get("userData");

  if (userData.sessionToken) {
    c.env.KV.delete(userData.sessionToken);
    return c.json({});
  }

  return c.json({}, 400);
});

const setSessionCookie = async (user: UserData, c) => {
  const sessionId = crypto.randomUUID();

  //TODO EXPIRES TIME?
  const expiresSeconds = 60 * 60 * 24 * 7;

  // const expiresSeconds = 60;
  await c.env.KV.put(sessionId, JSON.stringify(user), {
    expirationTtl: expiresSeconds,
  });

  setCookie(c, "session", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: expiresSeconds,
    path: "/",
  });
};

/*
POST Login
*/
authRoutes.post("/login", async (c) => {
  // const userData = c.get("userData");
  const payload = await c.req.json();

  const email = payload["email"];
  const password = payload["password"];

  const user = await authenticateUser(email, password, c.env.DB);
  if (user) {
    await setSessionCookie(user, c);
    return c.json({
      email: user.email,
    });
  } else {
    return c.json(
      {
        error: "Invalid credentials",
      },
      401
    );
  }
});

/*
POST Register 
*/
authRoutes.post("/register", async (c) => {
  const payload = await c.req.json();

  const email = payload["email"];
  const password = payload["password"];

  let user = null;
  try {
    user = await registerUser(email, password, c.env.DB);
  } catch (e) {
    if (
      e.message.includes("SQLITE_CONSTRAINT") &&
      e.message.includes("UNIQUE constraint failed: Users.email")
    ) {
      return c.json(
        {
          error: "Email is already registered",
        },
        400
      );
    }

    return c.json(
      {
        error: "Failed to register user",
      },
      400
    );
  }

  if (user) {
    await setSessionCookie(user, c);

    return c.json({
      email: user.email,
    });
  } else {
    return c.json(
      {
        error: "Invalid credentials",
      },
      401
    );
  }
});
export { authRoutes };
