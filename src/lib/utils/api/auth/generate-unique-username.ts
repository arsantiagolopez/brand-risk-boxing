import { db } from "@/lib/db";

export const generateUniqueUsername = async (
  email: string
): Promise<string> => {
  const username = email.split("@")[0];

  let uniqueUsername = username;
  let userExists = await checkUserExists(uniqueUsername);

  while (userExists) {
    // Generates a number between 0 and 99
    const randomSuffix = Math.floor(Math.random() * 100);
    uniqueUsername = username + randomSuffix;
    userExists = await checkUserExists(uniqueUsername);
  }

  return uniqueUsername;
};

const checkUserExists = async (username: string): Promise<boolean> => {
  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  return !!existingUser;
};
