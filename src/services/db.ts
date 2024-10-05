import bcrypt from "bcryptjs";
import { UserData } from "../types/bindings";

async function hashPassword(password: string) {
  const saltRounds = 10; // The higher, the more secure, but also slower
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function registerUser(
  email: string,
  password: string,
  db: D1Database
): Promise<UserData | null> {
  const hashedPassword = await hashPassword(password);

  // TODO check if this user already exists

  // Store in D1
  await db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .bind(email, hashedPassword)
    .run();

  return await authenticateUser(email, password, db);
}

export async function authenticateUser(
  email: string,
  password: string,
  db: D1Database
): Promise<UserData | null> {
  const user = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (!user) {
    return null; // User not found
  }

  // Compare provided password with stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    return {
      id: user.id,
      email: user.email,
      blocked_categories: user.blocked_categories,
      blocked_questions: user.blocked_questions,
    } as UserData;
  }

  return null;
}
