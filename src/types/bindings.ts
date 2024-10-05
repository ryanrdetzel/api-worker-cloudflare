export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
};

export type UserData = {
  id: string;
  email: string;
  sessionToken?: string;
};

declare module "hono" {
  interface ContextVariableMap {
    userData: UserData;
  }
}
