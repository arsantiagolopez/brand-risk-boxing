import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

import { fighters, records } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET Handler
const getFighters = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const fightersWithRecords = await db.query.fighters.findMany({
      with: {
        record: true,
      },
    });

    return res.status(200).json(fightersWithRecords);
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: "Failed to fetch fighters" });
  }
};

// POST Handler
const createFighter = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Start transaction
    await db.transaction(async (trx) => {
      // Create fighter
      const newFighters = await trx
        .insert(fighters)
        .values(req.body)
        .returning()
        .execute();

      if (!newFighters.length) {
        throw new Error("Fighter creation failed");
      }

      const fighterId = newFighters[0].id;

      // Create record for fighter
      const newRecords = await trx
        .insert(records)
        .values({
          fighterId,
          wins: 0,
          losses: 0,
          draws: 0,
        })
        .returning()
        .execute();

      if (!newRecords.length) {
        throw new Error("Record creation failed");
      }

      // @todo – write simpler `with` findMany
      const fighter = {
        ...newFighters[0],
        record: {
          wins: newRecords[0].wins,
          losses: newRecords[0].losses,
          draws: newRecords[0].draws,
        },
      };

      // @todo – Type fighter with record inside and send proper object
      // Commit transaction
      res.status(201).json(fighter);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to create fighter" });
  }
};

// PUT Handler
const updateFighter = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id, ...updateData } = req.body;

    const updatedFighter = await db
      .update(fighters)
      .set(updateData)
      .where(eq(fighters.id, id))
      .returning()
      .execute();

    // Check if the fighter was found and updated
    if (updatedFighter.length === 0) {
      res.status(404).json({ error: "Fighter not found" });
      return;
    }

    res.status(200).json(updatedFighter[0]);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to update fighter" });
  }
};

// DELETE Handler
const deleteFighter = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.body;

    const deleteResult = await db
      .delete(fighters)
      .where(eq(fighters.id, id))
      .execute();

    if (deleteResult.count === 0) {
      // If no fighter was deleted, it means the fighter was not found
      res.status(404).json({ error: "Fighter not found" });
      return;
    }

    res.status(204).end(); // Successfully deleted with no content to return
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to delete fighter" });
  }
};

// Main handler function
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await getFighters(req, res);

    case "POST":
      return await createFighter(req, res);

    case "PUT":
      return await updateFighter(req, res);

    case "DELETE":
      return await deleteFighter(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
};

export default handler;
