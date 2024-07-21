import type { Config } from "drizzle-kit";
import config from "@/config";

const drizzleConfig = {
  driver: "pg",
  schema: "src/lib/db/schema",
  out: "src/lib/db/migrations/data",
  dbCredentials: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.pass,
    database: config.db.name,
  },
} satisfies Config;

export default drizzleConfig;
