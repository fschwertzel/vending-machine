import {
  insertUserData,
  selectUserData,
  type UserData,
} from "../db/queries/Authentication.ts";
import { getLanguageHandler, getLogger } from "../index.ts";

export async function validateUsername(
  username: string,
): Promise<boolean | string> {
  if (username.length < 2 || username.length > 16) {
    return getLanguageHandler().getTranslation("auth.username.length");
  }
  if (!/^[0-9A-Za-z_]+$/.test(username)) {
    return getLanguageHandler().getTranslation("auth.username.invalid");
  }
  return true;
}

export function getUserData(username: string) {
  const userData = selectUserData(username);
  if (userData !== undefined) {
    return userData;
  }
  return generateUserData(username);
}

function generateUserData(username: string): UserData {
  const userData = insertUserData(username);
  getLogger().log({
    level: "info",
    message: `Generating new user data for: ${username}`,
  });
  if (!userData) {
    const err = new Error(`Failed to generate user data for: ${username}`);
    getLogger().log({
      level: "error",
      message: err.message,
      exitOnError: true,
    });
    throw err;
  }
  return userData;
}
