import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts, userProfiles } from ".";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  username: text("username").unique().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  userProfile: one(userProfiles),
  accounts: many(accounts),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
