import config from "@/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";

const connectionString = `postgres://${config.db.user}:${config.db.pass}@${config.db.host}:${config.db.port}/${config.db.name}`;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, {
  prepare: false,
});

const db = drizzle(client, {
  schema,
});

export { db };
