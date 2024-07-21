import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

import { fighterFights, fights } from "@/lib/db/schema";
import { eq, getTableColumns } from "drizzle-orm";

// GET Handler
const getFights = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { cardId: _, ...fightColumns } = getTableColumns(fights);

    // const fightsWithCardAndFighters = await db
    //   .select()
    //   .from(fights)
    //   .leftJoin(cards, eq(cards.id, fights.cardId))
    //   .leftJoin(fighterFights, eq(fighterFights.fightId, fights.id))
    //   .leftJoin(fighters, eq(fighters.id, fighterFights.fighterId))
    //   .execute();

    const fightsWithCardAndFighters = await db.query.fights.findMany({
      with: {
        card: true,
        home: true,
        away: true,
      },
    });

    console.log(
      "😎😎😎 fightsWithCardAndFighters: ",
      fightsWithCardAndFighters
    );

    return res.status(200).json(fightsWithCardAndFighters);
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json([]);
  }
};

// POST Handler
const createFight = async (req: NextApiRequest, res: NextApiResponse) => {
  const { cardId, homeId, awayId, minutes, rounds } = req.body;

  try {
    await db.transaction(async (trx) => {
      const newFights = await trx
        .insert(fights)
        .values({
          cardId,
          homeId,
          awayId,
          rounds,
          minutes,
        })
        .returning()
        .execute();

      if (!newFights.length) {
        throw new Error("Fight creation failed");
      }

      const fight = newFights[0];
      const fightId = fight.id;

      // Create home fighterFight
      const homeFighterFights = await trx
        .insert(fighterFights)
        .values({
          role: "home",
          fighterId: homeId,
          fightId,
        })
        .returning()
        .execute();

      if (!homeFighterFights.length) {
        throw new Error("Home FighterFight creation failed");
      }

      // Create away fighterFight
      const awayFighterFights = await trx
        .insert(fighterFights)
        .values({
          role: "away",
          fighterId: awayId,
          fightId,
        })
        .returning()
        .execute();

      if (!awayFighterFights.length) {
        throw new Error("Away FighterFight creation failed");
      }

      const newFightsWithCardAndFighters = await trx.query.fights.findMany({
        with: {
          card: true,
          home: true,
          away: true,
        },
      });

      res.status(201).json(newFightsWithCardAndFighters);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to create fighter and record" });
  }
};

// PUT Handler
const updateFight = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id, ...updateData } = req.body;

    const updatedFight = await db
      .update(fights)
      .set(updateData)
      .where(eq(fights.id, id))
      .returning()
      .execute();

    // Check if the fight was found and updated
    if (updatedFight.length === 0) {
      res.status(404).json({ error: "Fight not found" });
      return;
    }

    res.status(200).json(updatedFight[0]);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to update fight" });
  }
};

// DELETE Handler
const deleteFight = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.body;

    const deleteFight = await db
      .delete(fights)
      .where(eq(fights.id, id))
      .execute();

    if (deleteFight.count === 0) {
      res.status(404).json({ error: "Fight not found" });
      return;
    }

    res.status(204).end(); // Successfully deleted with no content to return
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to delete fight" });
  }
};

// Main handler function
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await getFights(req, res);

    case "POST":
      return await createFight(req, res);

    case "PUT":
      return await updateFight(req, res);

    case "DELETE":
      return await deleteFight(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
};

export default handler;
