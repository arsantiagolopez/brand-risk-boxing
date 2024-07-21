import { pgTable, integer, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { fighters } from ".";

export const records = pgTable("records", {
  id: uuid("id").primaryKey().defaultRandom(),

  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),

  fighterId: uuid("fighter_id")
    .notNull()
    .references(() => fighters.id, { onDelete: "cascade" }),
});

export const recordRelations = relations(records, ({ one }) => ({
  fighter: one(fighters, {
    fields: [records.fighterId],
    references: [fighters.id],
  }),
}));

export type Record = typeof records.$inferSelect;
export type NewRecord = typeof records.$inferInsert;
