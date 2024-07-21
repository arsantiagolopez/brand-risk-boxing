import type { NextApiRequest, NextApiResponse } from "next";
import { google, lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { OAuth2RequestError } from "arctic";
import { createUser } from "@/lib/utils/api/auth/create-user";
import config from "@/config";
import type { GoogleUser } from "@/types";
import { accounts } from "@/lib/db/schema";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(404).end();
    return;
  }

  const code = req.query.code?.toString() || null;
  const state = req.query.state?.toString() || null;

  const storedState = req.cookies.state || null;
  const storedCodeVerifier = req.cookies.code_verifier || null;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    res.status(400).end();
    return;
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );

    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const googleUser: GoogleUser = await response.json();

    const existingAccountByEmail = await db.query.accounts.findFirst({
      where: (account, { eq }) => eq(account.email, googleUser.email),
    });

    if (existingAccountByEmail) {
      // Check if the OAuth account exists
      const existingAccountByProvider = await db.query.accounts.findFirst({
        where: (account, { eq }) => eq(account.providerId, googleUser.sub),
      });

      // Create and link account to user
      if (!existingAccountByProvider) {
        const { email, userId } = existingAccountByEmail;

        const newAccounts = await db
          .insert(accounts)
          .values({
            email,
            provider: "google",
            providerId: googleUser.sub,
            userId,
          })
          .returning()
          .execute();

        if (!newAccounts.length) {
          throw new Error("Account creation failed");
        }
      }

      const session = await lucia.createSession(
        existingAccountByEmail.userId,
        {}
      );
      const sessionCookie = lucia.createSessionCookie(session.id);

      res
        .appendHeader("Set-Cookie", sessionCookie.serialize())
        .redirect(config.auth.successRedirectUrl);

      return;
    }

    const user = await createUser({ provider: "google", ...googleUser });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res
      .appendHeader("Set-Cookie", sessionCookie.serialize())
      .redirect(config.auth.successRedirectUrl);
  } catch (error) {
    console.log("❌ Error:", error);

    // the specific error message depends on the provider
    if (error instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }

    res.status(500).end();
  }
};

export default handler;
