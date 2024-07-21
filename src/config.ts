import type { Config } from "./types";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const config = {
  db: {
    host: process.env.DB_HOST || "host",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "name",
    user: process.env.DB_USER || "user",
    pass: process.env.DB_PASS || "pass",
  },
  auth: {
    successRedirectUrl: (process.env.NEXT_PUBLIC_SUCCESS_REDIRECT_URL ||
      "/") as Config["auth"]["successRedirectUrl"],
    socials: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectURI: process.env.GOOGLE_REDIRECT_URI || "",
      },
    },
  },
  misc: {
    defaultErrorMessage:
      process.env.NEXT_PUBLIC_DEFAULT_ERROR_MESSAGE ||
      "Something's off. Try again in a bit.",
  },
} satisfies Config;

export default config;
