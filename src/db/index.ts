import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

export type Sg16Database = DrizzleD1Database<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  __sg16LibsqlClient?: Client;
  __sg16LibsqlDb?: Sg16Database;
};

async function getD1Binding(): Promise<D1Database | null> {
  try {
    const { env } = await import("cloudflare:workers");
    const binding = (env as { DB?: D1Database }).DB;
    return binding ?? null;
  } catch {
    return null;
  }
}

function getLocalLibsqlDb(): Sg16Database {
  if (globalForDb.__sg16LibsqlDb) {
    return globalForDb.__sg16LibsqlDb;
  }

  const url = process.env.LOCAL_DATABASE_URL ?? "file:.data/sg16finance.db";
  const client =
    globalForDb.__sg16LibsqlClient ??
    createClient({
      url,
    });

  globalForDb.__sg16LibsqlClient = client;
  globalForDb.__sg16LibsqlDb = drizzleLibsql(client, { schema }) as unknown as Sg16Database;
  return globalForDb.__sg16LibsqlDb;
}

/** Cloudflare D1 in production; local SQLite file for `next dev`. */
export async function getDb(): Promise<Sg16Database> {
  const d1 = await getD1Binding();
  if (d1) {
    return drizzle(d1, { schema });
  }
  return getLocalLibsqlDb();
}
