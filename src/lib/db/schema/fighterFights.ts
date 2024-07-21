import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { fighters, fights } from ".";
import { relations } from "drizzle-orm";

export const fighterFights = pgTable("fighter_fights", {
  id: uuid("id").primaryKey().defaultRandom(),

  role: text("role", { enum: ["home", "away"] }).notNull(),
  result: text("result", {
    enum: ["pending", "win", "lose", "draw"],
  })
    .default("pending")
    .notNull(),
  fightId: uuid("fight_id")
    .notNull()
    .references(() => fights.id, { onDelete: "cascade" }),
  fighterId: uuid("fighter_id")
    .notNull()
    .references(() => fighters.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const fighterFightsRelations = relations(fighterFights, ({ one }) => ({
  fight: one(fights, {
    fields: [fighterFights.fightId],
    references: [fights.id],
  }),
  fighter: one(fighters, {
    fields: [fighterFights.fighterId],
    references: [fighters.id],
  }),
}));

export type FighterFight = typeof fighterFights.$inferSelect;
export type NewFighterFight = typeof fighterFights.$inferInsert;
