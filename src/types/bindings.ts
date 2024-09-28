import type { User } from "@clerk/backend";

export type Bindings = {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_PUBLIC_KEY: string;
};

export type UserData = {
  id: string;
  username: string;
  email: string;
};

declare module "hono" {
  interface ContextVariableMap {
    user: User;
    userData: UserData;
  }
}
