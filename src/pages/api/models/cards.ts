import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

import { cards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET Handler
const getCards = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const allCards = await db.query.cards.findMany({
      with: {
        fights: {
          with: {
            home: true,
            away: true,
          },
        },
      },
    });
    return res.status(200).json(allCards);
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: "Failed to fetch fights" });
  }
};

// POST Handler
const createCard = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const newCards = await db
      .insert(cards)
      .values(req.body)
      .returning()
      .execute();

    if (!newCards.length) {
      throw new Error("Card creation failed");
    }

    res.status(200).json(newCards[0]);
  } catch (error) {
    console.error("❌ Error:", error);

    let errorMessage = "Failed to create fighter and record";

    if (error instanceof Error) {
      const { message } = error;

      switch (true) {
        // Existing card number
        case message.includes("cards_number_unique"):
          errorMessage = "❌ Card number already exists. Try a different one.";
          break;
      }
    }
    console.error("❌ Error:", error);
    res.status(500).json({ error: errorMessage });
  }
};

// PUT Handler
const updateCard = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id, ...updateData } = req.body;

    const updatedCard = await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, id))
      .returning()
      .execute();

    // Check if the card was found and updated
    if (updatedCard.length === 0) {
      res.status(404).json({ error: "Fight not found" });
      return;
    }

    res.status(200).json(updatedCard[0]);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to update fight" });
  }
};

// DELETE Handler
const deleteCard = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.body;

    const deleteCard = await db.delete(cards).where(eq(cards.id, id)).execute();

    if (deleteCard.count === 0) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    res.status(204).end(); // Successfully deleted with no content to return
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
};

// Main handler function
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return await getCards(req, res);

    case "POST":
      return await createCard(req, res);

    case "PUT":
      return await updateCard(req, res);

    case "DELETE":
      return await deleteCard(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
};

export default handler;
