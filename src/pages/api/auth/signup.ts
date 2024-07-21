import type { NextApiRequest, NextApiResponse } from "next";
import { isValidEmail, isValidUsername } from "@/lib/utils/auth";
import { lucia } from "@/lib/auth";
import { createUser } from "@/lib/utils/api/auth/create-user";
import config from "@/config";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password, username, name } = req.body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }

  if (!username || typeof username !== "string" || !isValidUsername(username)) {
    res.status(400).json({ error: "Invalid username" });
    return;
  }

  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Invalid name" });
    return;
  }

  try {
    const user = await createUser({
      provider: "local",
      email,
      name,
      password,
      username,
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res.setHeader("Set-Cookie", sessionCookie.serialize());
    res.status(200).json({});
  } catch (error) {
    console.error("❌ Error:", error);

    let errorMessage = config.misc.defaultErrorMessage;

    if (error instanceof Error) {
      const { message } = error;

      switch (true) {
        // Email already exists
        case message.includes("users_email_unique"):
          errorMessage = "Email already exists. Try a different one.";
          break;

        // Username already exists
        case message.includes("users_username_unique"):
          errorMessage = "Username already exists. Try a different one.";
          break;
      }
    }

    res.status(400).json({ error: errorMessage });
  }
};

export default handler;
