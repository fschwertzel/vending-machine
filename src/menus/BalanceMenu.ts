import { number, select } from "@inquirer/prompts";
import { getLanguageHandler } from "../index.ts";
import {
  VENDING_MACHINE_THEME,
  type VendingMachine,
} from "../utils/VendingMachine.ts";
import {
  getUserBalance,
  validateInputAmount,
} from "../handlers/BalanceHandler.ts";
import { displayErrorProceedMenu } from "./ErrorMenu.ts";
import { displayStartMenu } from "./StartMenu.ts";
import type { User } from "../utils/User.ts";

export const BALANCE_OPTIONS = {
  TOP_UP_ROOT: 0,
  WITHDRAW_ROOT: 1,
  RETURN: 2,
};

export const TOP_UP_OPTIONS = {
  TOP_UP_1000: 1000,
  TOP_UP_2500: 2500,
  TOP_UP_5000: 5000,
  TOP_UP_10000: 10000,
  TOP_UP_CUSTOM: 0,
  RETURN: 1,
};
export const WITHDRAW_OPTIONS = {
  WITHDRAW_1000: 1000,
  WITHDRAW_2500: 2500,
  WITHDRAW_5000: 5000,
  WITHDRAW_10000: 10000,
  WITHDRAW_CUSTOM: 0,
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
          value: BALANCE_OPTIONS.TOP_UP_ROOT,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.withdraw"),
          value: BALANCE_OPTIONS.WITHDRAW_ROOT,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.return"),
          value: BALANCE_OPTIONS.RETURN,
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
  const availableAmounts = [1000, 2500, 5000, 10000];
  const topUpOptions = [
    ...availableAmounts.map((amount) => ({
      name: `¥${amount}`,
      value: TOP_UP_OPTIONS[`TOP_UP_${amount}` as keyof typeof TOP_UP_OPTIONS],
    })),
    {
      name: languageHandler.getTranslation("menu.option.balance.prompt.custom"),
      value: TOP_UP_OPTIONS.TOP_UP_CUSTOM,
    },
    {
      name: languageHandler.getTranslation("menu.start.option.return"),
      value: TOP_UP_OPTIONS.RETURN,
    },
  ];
  const withdrawOptions = [
    ...availableAmounts.map((amount) => ({
      name: `¥${amount}`,
      value:
        WITHDRAW_OPTIONS[`WITHDRAW_${amount}` as keyof typeof WITHDRAW_OPTIONS],
    })),
    {
      name: languageHandler.getTranslation("menu.option.balance.prompt.custom"),
      value: WITHDRAW_OPTIONS.WITHDRAW_CUSTOM,
    },
    {
      name: languageHandler.getTranslation("menu.start.option.return"),
      value: WITHDRAW_OPTIONS.RETURN,
    },
  ];
  switch (option) {
    case BALANCE_OPTIONS.TOP_UP_ROOT:
    case BALANCE_OPTIONS.WITHDRAW_ROOT:
      const isTopUp = option === BALANCE_OPTIONS.TOP_UP_ROOT;
      const subOption = await select(
        {
          message: languageHandler.getTranslation(
            `menu.start.option.${isTopUp ? "topup" : "withdraw"}.prompt`,
          ),
          choices: [...(isTopUp ? topUpOptions : withdrawOptions)],
          theme: VENDING_MACHINE_THEME,
        },
        { clearPromptOnDone: true },
      );
      if (isTopUp) {
        await handleTopUpMenu(vendingMachine, subOption);
      } else {
        await awaitWithdrawMenu(vendingMachine, subOption);
      }
      break;
    case BALANCE_OPTIONS.RETURN:
      await displayStartMenu(vendingMachine);
      return;
  }
}

async function handleTopUpMenu(vendingMachine: VendingMachine, option: number) {
  const user = vendingMachine.getUser();
  switch (option) {
    case TOP_UP_OPTIONS.TOP_UP_1000:
    case TOP_UP_OPTIONS.TOP_UP_2500:
    case TOP_UP_OPTIONS.TOP_UP_5000:
    case TOP_UP_OPTIONS.TOP_UP_10000:
      await handleInputValidation(user, option, () => user.addBalance(option));
      break;
    case TOP_UP_OPTIONS.TOP_UP_CUSTOM:
      const amount = await getCustomInput(
        getLanguageHandler().getTranslation("menu.start.option.topup.prompt"),
      );
      await handleInputValidation(user, amount, () => user.addBalance(amount));
      break;
    case TOP_UP_OPTIONS.RETURN:
      await displayBalanceMenu(vendingMachine);
      return;
  }
  await displayBalanceMenu(vendingMachine);
}

async function awaitWithdrawMenu(
  vendingMachine: VendingMachine,
  option: number,
) {
  const user = vendingMachine.getUser();
  switch (option) {
    case WITHDRAW_OPTIONS.WITHDRAW_1000:
    case WITHDRAW_OPTIONS.WITHDRAW_2500:
    case WITHDRAW_OPTIONS.WITHDRAW_5000:
    case WITHDRAW_OPTIONS.WITHDRAW_10000:
      await handleInputValidation(user, option, () =>
        user.removeBalance(option),
      );
      break;
    case WITHDRAW_OPTIONS.WITHDRAW_CUSTOM:
      const amount = await getCustomInput(
        getLanguageHandler().getTranslation(
          "menu.start.option.withdraw.prompt",
        ),
      );
      await handleInputValidation(user, amount, () =>
        user.removeBalance(amount),
      );
      break;
    case WITHDRAW_OPTIONS.RETURN:
      await displayBalanceMenu(vendingMachine);
      return;
  }
  await displayBalanceMenu(vendingMachine);
}

async function handleInputValidation(
  user: User,
  amount: number,
  callback: () => boolean | void | Promise<boolean | void>,
): Promise<void> {
  const res = validateInputAmount(user.getUserID(), amount);
  if (typeof res === "string") {
    await displayErrorProceedMenu(`${res}`);
  } else if (callback() === false) {
    await displayErrorProceedMenu(
      getLanguageHandler().getTranslation("menu.balance.input.invalid"),
    );
  }
}

async function getCustomInput(prompt: string): Promise<number> {
  return await number(
    {
      message: prompt,
      theme: VENDING_MACHINE_THEME,
      required: true,
      default: 1000,
    },
    { clearPromptOnDone: true },
  );
}
