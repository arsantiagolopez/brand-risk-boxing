import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type Fight, fights } from ".";

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),

  number: integer("number").unique().notNull(),
  date: timestamp("date", { mode: "string" }).notNull(),
  location: text("location").default("Miami").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const cardRelations = relations(cards, ({ many }) => ({
  fights: many(fights),
}));

export type Card = typeof cards.$inferSelect & {
  fights: Fight[];
};
export type NewCard = typeof cards.$inferInsert;
