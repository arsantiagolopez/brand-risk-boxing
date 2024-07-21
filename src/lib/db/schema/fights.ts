import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type Fighter, cards, fighters, type Card } from ".";

export const fights = pgTable("fights", {
  id: uuid("id").primaryKey().defaultRandom(),

  minutes: text("minutes", { enum: ["1", "2", "3", "4", "5"] })
    .default("3")
    .notNull(),
  rounds: text("rounds", { enum: ["3", "5"] })
    .default("3")
    .notNull(),

  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  homeId: uuid("home_id")
    .notNull()
    .references(() => fighters.id),
  awayId: uuid("away_id")
    .notNull()
    .references(() => fighters.id),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const fightRelations = relations(fights, ({ one }) => ({
  card: one(cards, {
    fields: [fights.cardId],
    references: [cards.id],
  }),
  home: one(fighters, {
    fields: [fights.homeId],
    references: [fighters.id],
  }),
  away: one(fighters, {
    fields: [fights.awayId],
    references: [fighters.id],
  }),
}));

export type Fight = typeof fights.$inferSelect & {
  card: Card;
  home: Fighter;
  away: Fighter;
};
export type NewFight = typeof fights.$inferInsert;
