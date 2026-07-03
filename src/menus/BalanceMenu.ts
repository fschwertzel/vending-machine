import { number, select } from "@inquirer/prompts";
import { getLanguageHandler, getLogger } from "../index.ts";
import {
  VENDING_MACHINE_THEME,
  type VendingMachine,
} from "../utils/VendingMachine.ts";
import {
  getUserBalance,
  validateInputAmount,
} from "../handlers/BalanceHandler.ts";
import { displayErrorRetryMenu } from "./ErrorMenu.ts";
import { displayStartMenu } from "./StartMenu.ts";

export const BALANCE_MENU_OPTIONS = {
  TOP_UP_ROOT: 0,
  WITHDRAW_ROOT: 1,
  RETURN: 2,
};

export const TOP_UP_MENU_OPTIONS = {
  TOP_UP_1000: 1000,
  TOP_UP_2500: 2500,
  TOP_UP_5000: 5000,
  TOP_UP_10000: 10000,
  TOP_UP_CUSTOM: 0,
  RETURN: 1,
};

export async function displayBalanceMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();
  const currentBalance = getUserBalance(vendingMachine.getUser().getUserID());
  const selectedOption = await select(
    {
      message: languageHandler.getTranslation("menu.balance.prompt", [
        currentBalance.toString(),
      ]),
      choices: [
        {
          name: languageHandler.getTranslation("menu.start.option.topup"),
          value: BALANCE_MENU_OPTIONS.TOP_UP_ROOT,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.withdraw"),
          value: BALANCE_MENU_OPTIONS.WITHDRAW_ROOT,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.return"),
          value: BALANCE_MENU_OPTIONS.RETURN,
        },
      ],
      theme: VENDING_MACHINE_THEME,
    },
    { clearPromptOnDone: true },
  );
  await handleBalanceMenu(vendingMachine, selectedOption);
}

export async function handleBalanceMenu(
  vendingMachine: VendingMachine,
  option: number,
) {
  const languageHandler = getLanguageHandler();
  switch (option) {
    case BALANCE_MENU_OPTIONS.TOP_UP_ROOT:
      const subOption = await select(
        {
          message: languageHandler.getTranslation(
            "menu.start.option.topup.prompt",
          ),
          choices: [
            {
              name: "¥1000",
              value: TOP_UP_MENU_OPTIONS.TOP_UP_1000,
            },
            {
              name: "¥2500",
              value: TOP_UP_MENU_OPTIONS.TOP_UP_2500,
            },
            {
              name: "¥5000",
              value: TOP_UP_MENU_OPTIONS.TOP_UP_5000,
            },
            {
              name: "¥10000",
              value: TOP_UP_MENU_OPTIONS.TOP_UP_10000,
            },
            {
              name: languageHandler.getTranslation(
                "menu.start.option.topup.prompt.custom",
              ),
              value: TOP_UP_MENU_OPTIONS.TOP_UP_CUSTOM,
            },
            {
              name: languageHandler.getTranslation("menu.start.option.return"),
              value: TOP_UP_MENU_OPTIONS.RETURN,
            },
          ],
          theme: VENDING_MACHINE_THEME,
        },
        { clearPromptOnDone: true },
      );
      await handleTopUpMenu(vendingMachine, subOption);
      break;
    case BALANCE_MENU_OPTIONS.RETURN:
      await displayStartMenu(vendingMachine);
      return;
  }
}

async function handleTopUpMenu(vendingMachine: VendingMachine, option: number) {
  const languageHandler = getLanguageHandler();
  const user = vendingMachine.getUser();
  switch (option) {
    case TOP_UP_MENU_OPTIONS.TOP_UP_1000:
    case TOP_UP_MENU_OPTIONS.TOP_UP_2500:
    case TOP_UP_MENU_OPTIONS.TOP_UP_5000:
    case TOP_UP_MENU_OPTIONS.TOP_UP_10000:
      while (true) {
        const res = validateInputAmount(user.getUserID(), option);
        if (typeof res === "string") {
          const shouldRetry = await displayErrorRetryMenu(
            `${res}\n${languageHandler.getTranslation("menu.error.prompt.q")}`,
          );
          if (shouldRetry) {
            continue;
          }
          break;
        }
        user.addBalance(option);
        break;
      }
      break;
    case TOP_UP_MENU_OPTIONS.TOP_UP_CUSTOM:
      const amount = await number(
        {
          message: languageHandler.getTranslation(
            "menu.start.option.topup.prompt",
          ),
          theme: VENDING_MACHINE_THEME,
          required: true,
          default: 1000,
          validate: async function (amount) {
            return validateInputAmount(user.getUserID(), amount);
          },
        },
        { clearPromptOnDone: true },
      );
      user.addBalance(amount);
      break;
    case TOP_UP_MENU_OPTIONS.RETURN:
      await displayBalanceMenu(vendingMachine);
      return;
  }
  await displayBalanceMenu(vendingMachine);
}
