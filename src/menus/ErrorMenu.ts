import { expand } from "@inquirer/prompts";
import { getLanguageHandler } from "../index.ts";

export const ERROR_MENU_OPTIONS = {
  YES: 0,
  NO: 1,
};

export async function displayErrorRetryMenu(
  errorMessage: string,
): Promise<boolean> {
  const languageHandler = getLanguageHandler();
  const choice = await expand({
    message: errorMessage,
    choices: [
      {
        key: "y",
        name: languageHandler.getTranslation("menu.error.prompt.y"),
        value: ERROR_MENU_OPTIONS.YES,
      },
      {
        key: "n",
        name: languageHandler.getTranslation("menu.error.prompt.n"),
        value: ERROR_MENU_OPTIONS.NO,
      },
    ],
  });
  return choice === ERROR_MENU_OPTIONS.YES;
}
