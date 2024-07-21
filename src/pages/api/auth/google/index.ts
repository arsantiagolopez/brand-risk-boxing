import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "@/lib/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { serializeCookie } from "oslo/cookie";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(404).end();
    return;
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const options = {
    scopes: ["profile", "email"],
  };

  const url = await google.createAuthorizationURL(state, codeVerifier, options);

  res.setHeader("Set-Cookie", [
    serializeCookie("state", state, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10, // 10 min
    }),
    serializeCookie("code_verifier", codeVerifier, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10, // 10 min
    }),
  ]);

  res.redirect(url.toString());
};

export default handler;
