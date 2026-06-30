import { getLanguageProcessor } from "../index.ts";

export async function validateUsername(
  username: string,
): Promise<boolean | string> {
  if (username.length < 2 || username.length > 16) {
    return getLanguageProcessor().getTranslation("auth.username.length");
  }
  if (!/^[0-9A-Za-z_]+$/.test(username)) {
    return getLanguageProcessor().getTranslation("auth.username.invalid");
  }
  return true;
}
