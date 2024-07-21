import type { NextApiRequest, NextApiResponse } from "next";
import { Argon2id } from "oslo/password";
import { lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidUsername } from "@/lib/utils/auth";

type RequestBody = {
  username: string;
  password: string;
} | null;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(404).json({});
    return;
  }

  const body: RequestBody = req.body;
  const username = body?.username;

  if (!username || !isValidUsername(username)) {
    res.status(400).json({
      error: "Invalid username",
    });
    return;
  }

  const password = body?.password;

  if (!password || password.length < 6 || password.length > 255) {
    res.status(400).json({
      error: "Invalid password",
    });
    return;
  }

  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username.toLowerCase()),
  });

  if (!existingUser) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is none-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    res.status(400).json({
      error: "Incorrect username or password",
    });
    return;
  }

  const account = await db.query.accounts.findFirst({
    where: (account, { eq, and }) =>
      and(eq(account.userId, existingUser.id), eq(account.provider, "local")),
  });

  if (!account?.hashedPassword) {
    res.status(400).json({
      error: "Incorrect username or password",
    });
    return;
  }

  const validPassword = await new Argon2id().verify(
    account.hashedPassword,
    password
  );

  if (!validPassword) {
    res.status(400).json({
      error: "Incorrect username or password",
    });
    return;
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  res.setHeader("Set-Cookie", sessionCookie.serialize());
  res.status(200).json({});
};

export default handler;
