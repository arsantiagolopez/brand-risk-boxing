import { db } from "@/lib/db";
import { accounts, userProfiles, users } from "@/lib/db/schema";
import { Argon2id } from "oslo/password";
import { generateUniqueUsername } from "./generate-unique-username";
import type { GoogleUser } from "@/types";

const createLocal = async ({
  provider,
  email,
  password,
  username,
  name,
}: LocalFields) => {
  const hashedPassword = await new Argon2id().hash(password);

  const user = await db.transaction(async (trx) => {
    // Create user
    const newUsers = await trx
      .insert(users)
      .values({
        email,
        username,
      })
      .returning()
      .execute();

    if (!newUsers.length) {
      throw new Error("User creation failed");
    }

    const user = newUsers[0];
    const userId = user.id;

    // Create profile
    const newProfiles = await trx
      .insert(userProfiles)
      .values({
        userId,
        name,
      })
      .returning()
      .execute();

    if (!newProfiles.length) {
      throw new Error("Profile creation failed");
    }

    // Create account
    const newAccounts = await trx
      .insert(accounts)
      .values({
        email,
        provider,
        hashedPassword,
        userId,
      })
      .returning()
      .execute();

    if (!newAccounts.length) {
      throw new Error("Account creation failed");
    }

    return user;
  });

  return user;
};

const createSocial = async ({
  provider,
  sub,
  email,
  name,
  picture,
}: GoogleFields) => {
  const username = await generateUniqueUsername(email);

  const user = await db.transaction(async (trx) => {
    // Create user
    const newUsers = await trx
      .insert(users)
      .values({
        email,
        username,
        // @todo – Shall emails be verified if logging from social?
      })
      .returning()
      .execute();

    if (!newUsers.length) {
      throw new Error("User creation failed");
    }

    const user = newUsers[0];
    const userId = user.id;

    // Create profile
    const newProfiles = await trx
      .insert(userProfiles)
      .values({
        userId,
        name,
        picture,
      })
      .returning()
      .execute();

    if (!newProfiles.length) {
      throw new Error("Profile creation failed");
    }

    // Create account
    const newAccounts = await trx
      .insert(accounts)
      .values({
        email,
        provider,
        providerId: sub,
        userId,
      })
      .returning()
      .execute();

    if (!newAccounts.length) {
      throw new Error("Account creation failed");
    }

    return user;
  });

  return user;
};

type LocalFields = {
  provider: "local";
  email: string;
  username: string;
  name: string;
  password: string;
};

type GoogleFields = {
  provider: "google";
} & GoogleUser;

export const createUser = async (fields: LocalFields | GoogleFields) => {
  const { provider } = fields;

  switch (provider) {
    case "local":
      return createLocal(fields);

    case "google":
      return createSocial(fields);
  }
};
