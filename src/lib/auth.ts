import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";
import { db } from "./db";
import { sessions, users } from "./db/schema";
import { Google } from "arctic";
import config from "@/config";

type DatabaseUserAttributes = {
  email: string;
};

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production", // set `Secure` flag in HTTPS
      // sameSite: "strict",
      // domain: "example.com"
    },
  },
  sessionExpiresIn: new TimeSpan(2, "w"),
  getUserAttributes: (attributes) => {
    return {
      // we don't need to expose the hashed password!
      email: attributes.email,
    };
  },
  // getSessionAttributes: async (databaseSessionAttributes) => {
  // const session = await drizzle.query(Sessions).filter({ id: sessionId }).first();
  // if (!session) return [null, null];
  // const user = await drizzle.query(Users).filter({ id: session.userId }).first();
  // return [session, user];
  // return {
  //   email:
  // }
  // },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export const google = new Google(
  config.auth.socials.google.clientId,
  config.auth.socials.google.clientSecret,
  config.auth.socials.google.redirectURI
);
