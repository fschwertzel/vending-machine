import { confirm, expand, select } from "@inquirer/prompts";
import { getLanguageHandler } from "../index.ts";
import { VENDING_MACHINE_THEME } from "../utils/VendingMachine.ts";

export const ERROR_MENU_OPTIONS = {
  YES: 0,
  NO: 1,
  PROCEED: 2,
};

export async function displayErrorRetryMenu(
  errorMessage: string,
): Promise<boolean> {
  const languageHandler = getLanguageHandler();
  const choice = await expand(
    {
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
      theme: VENDING_MACHINE_THEME,
    },
    { clearPromptOnDone: true },
  );
  return choice === ERROR_MENU_OPTIONS.YES;
}

export async function displayErrorProceedMenu(
  errorMessage: string,
): Promise<boolean> {
  await select(
    {
      message: errorMessage,
      choices: [
        {
          name: getLanguageHandler().getTranslation("menu.error.prompt.p"),
          value: ERROR_MENU_OPTIONS.PROCEED,
        },
      ],
      theme: VENDING_MACHINE_THEME,
    },
    { clearPromptOnDone: true },
  );
  return true;
}
