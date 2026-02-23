import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL ?? "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export function getDb() {
  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof getDb>;
export { schema };
