import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from ".";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
