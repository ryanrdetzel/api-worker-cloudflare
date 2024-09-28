import { Hono } from "hono";
import type { Bindings, UserData } from "../types/bindings";
import {
  getUserData,
  createUser,
  getUserDataByEmail,
  updateUser,
} from "../services/db";

const sessionRoutes = new Hono<{ Bindings: Bindings }>();

sessionRoutes.get("/session", async (c) => {
  const user = c.get("user");
  let userData = c.get("userData");

  if (!userData) {
    // Find the user by email an dupdate the user_id
    const existingUser = await getUserDataByEmail(
      c.env.DB,
      user.emailAddresses[0].emailAddress
    );

    console.log("Got existing user for email");
    if (existingUser) {
      // Update this record with the new user_id
      try {
        await updateUser(
          c.env.DB,
          user.id,
          user.emailAddresses[0].emailAddress
        );
        console.log("Updated user");
        userData = (await getUserData(c.env.DB, user.id)) as UserData;
      } catch (error) {
        console.error("Error updating user:", error);
        return c.json({ message: "Error updating user" }, 500);
      }
    } else {
      try {
        console.log("Creating new user");
        await createUser(
          c.env.DB,
          user.id,
          user.emailAddresses[0].emailAddress
        );
        userData = (await getUserData(c.env.DB, user.id)) as UserData;
      } catch (error) {
        console.error("Error creating user:", error);
        return c.json({ message: "Error creating user" }, 500);
      }
    }
  }

  return c.json({
    email: userData.email,
  });
});

export { sessionRoutes };
