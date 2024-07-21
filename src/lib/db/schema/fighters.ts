import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { fighterFights, records } from ".";
import { platformNames } from "@/lib/constants";

export const fighters = pgTable("fighters", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  nickname: text("nickname"),

  sex: text("sex", { enum: ["man", "woman"] }).default("man"),
  weight: integer("weight").notNull(),
  nationality: text("nationality").notNull(),
  image: text("image").notNull(),

  platform: text("platform", {
    enum: platformNames,
  }),
  platformUsername: text("platform_username"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const fighterRelations = relations(fighters, ({ one, many }) => ({
  record: one(records),
  homeFights: many(fighterFights, {
    relationName: "home",
  }),
  awayFights: many(fighterFights, {
    relationName: "away",
  }),
}));

export type Fighter = typeof fighters.$inferSelect;
export type NewFighter = typeof fighters.$inferInsert;
