import { number, select } from "@inquirer/prompts";
import { getLanguageHandler, getLogger } from "../index.ts";
import {
  VENDING_MACHINE_THEME,
  type VendingMachine,
} from "../utils/VendingMachine.ts";
import { getUserBalance } from "../handlers/BalanceHandler.ts";
import { displayStartMenu } from "./StartMenu.ts";

export const BALANCE_MENU_OPTIONS = {
  TOP_UP: 0,
  WITHDRAW: 1,
};

export async function displayBalanceMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();
  const currentBalance = getUserBalance(vendingMachine.getUser().getUserID());
  const selectedOption = await select(
    {
      message: languageHandler.getTranslation("menu.balance.prompt", [
        currentBalance.toString(), // returns an obj for some reason
      ]),
      choices: [
        {
          name: languageHandler.getTranslation("menu.start.option.topup"),
          value: BALANCE_MENU_OPTIONS.TOP_UP,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.withdraw"),
          value: BALANCE_MENU_OPTIONS.WITHDRAW,
        },
      ],
      theme: VENDING_MACHINE_THEME,
    },
    { clearPromptOnDone: true },
  );
  await handleBalanceMenuOption(vendingMachine, selectedOption);
}

export async function handleBalanceMenuOption(
  vendingMachine: VendingMachine,
  option: number,
) {
  const languageHandler = getLanguageHandler();
  switch (option) {
    case BALANCE_MENU_OPTIONS.TOP_UP:
      const amount = await number(
        {
          message: languageHandler.getTranslation(
            "menu.start.option.topup.prompt",
          ),
          theme: VENDING_MACHINE_THEME,
          required: true,
          default: 1000,
          validate: function (amount) {
            return vendingMachine.getUser().addBalance(amount);
          },
        },
        { clearPromptOnDone: true },
      ).catch((e) => {
        const err = new Error(`Failed to top up user's balance: ${e}`);
        getLogger().log({
          level: "error",
          message: err.message,
          exitOnError: true,
        });
        throw err;
      });
      await displayBalanceMenu(vendingMachine);
  }
}
