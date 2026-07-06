import { select } from "@inquirer/prompts";
import { getLanguageHandler } from "../index.ts";
import {
  VENDING_MACHINE_THEME,
  type VendingMachine,
} from "../utils/VendingMachine.ts";
import { displayBalanceMenu } from "./BalanceMenu.ts";
import { displayProductMenu } from "./ProductMenu.ts";

export const START_MENU_OPTIONS = {
  BALANCE: 0,
  PRODUCTS: 1,
};

export async function displayStartMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();
  const selectedOption = await select(
    {
      message: languageHandler.getTranslation(
        "menu.start.prompt",
        [vendingMachine.getUser().getUsername()],
        true,
      ),
      choices: [
        {
          name: languageHandler.getTranslation("menu.start.option.balance"),
          value: START_MENU_OPTIONS.BALANCE,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.products"),
          value: START_MENU_OPTIONS.PRODUCTS,
        },
      ],
      theme: VENDING_MACHINE_THEME,
    },
    { clearPromptOnDone: true },
  );
  await handleStartMenuOption(vendingMachine, selectedOption);
}

export async function handleStartMenuOption(
  vendingMachine: VendingMachine,
  option: number,
) {
  switch (option) {
    case START_MENU_OPTIONS.BALANCE:
      await displayBalanceMenu(vendingMachine);
      break;
    case START_MENU_OPTIONS.PRODUCTS:
      await displayProductMenu(vendingMachine);
      break;
    default:
      await displayStartMenu(vendingMachine);
      break;
  }
}
