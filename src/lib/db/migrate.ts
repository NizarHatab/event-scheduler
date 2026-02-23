import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@libsql/client";

const MIGRATIONS_DIR = join(process.cwd(), "drizzle");

function getClient() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:./local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
}

export async function runMigrations(): Promise<void> {
  const client = getClient();
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      if (stmt.length > 0) {
        await client.execute(stmt + ";");
      }
    }
  }
}
