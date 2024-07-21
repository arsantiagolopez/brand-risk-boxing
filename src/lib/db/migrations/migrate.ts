import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "..";

const migrateDb = async () => {
  try {
    console.log("🕒 Migrating the client...");

    await migrate(db, {
      migrationsFolder: "./src/lib/db/migrations/data",
    });

    console.log("✅ Successfully migrated!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed.");
    throw err;
  }
};

migrateDb();
