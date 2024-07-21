import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from ".";

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  email: text("email").notNull(),
  hashedPassword: text("hashed_password"),

  provider: text("provider", {
    enum: ["local", "google", "x"],
  })
    .notNull()
    .default("local"),
  providerId: text("provider_id"),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
