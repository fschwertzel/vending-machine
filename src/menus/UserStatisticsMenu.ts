import { select } from "@inquirer/prompts";
import { selectUserStatistics, type UserStatisticsResult } from "../db/queries/Statistics.ts";
import { getLanguageHandler } from "../index.ts";
import { VENDING_MACHINE_THEME, type VendingMachine } from "../utils/VendingMachine.ts";
import { displayStartMenu } from "./StartMenu.ts";

type UserStatistic = {
  name: string,
  value: number
}

const STATISTIC_OPTIONS = {
  IGNORE: 0,
  RETURN: 1
}

const NAME_FIELD_LENGTH_EN = 8;
const PRODUCT_AMOUNT_FIELD_EN = 18;
const TOTAL_SPENT_FIELD_EN = 15;

const NAME_FIELD_LENGTH_JP = 10;
const PRODUCT_AMOUNT_FIELD_JP = 8;
const TOTAL_SPENT_FIELD_JP = 9;

export async function displayUserStatisticsMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();

  const userStatisticData = selectUserStatistics();
  const userStatistics : UserStatistic[]= [];

  if (userStatisticData !== undefined) {
    userStatisticData.forEach((data) => {
      userStatistics.push({
        name: formatUserStatistic(
          data.username,
          data.product_amount,
          data.spent_amount,
          languageHandler.getUserLanguage()
        ),
        value: STATISTIC_OPTIONS.IGNORE,
      });
    });
  }
  const selectedOption = await select(
    {
      message: languageHandler.getTranslation("menu.user_statistics.title"),
      choices: [
      ...userStatistics,
        {
          name: languageHandler.getTranslation("menu.start.option.return"),
          value: STATISTIC_OPTIONS.RETURN,
        },
      ],
      pageSize: 10,
      theme: VENDING_MACHINE_THEME,
      loop: false,
    },
    { clearPromptOnDone: true },
  );
  if (selectedOption === STATISTIC_OPTIONS.RETURN) {
    await displayStartMenu(vendingMachine);
    return;
  } else {
    await displayUserStatisticsMenu(vendingMachine);
  }
}

function formatUserStatistic(username: string, productAmount : number, totalSpent: number, language: string): string {
  const productAmountStr = productAmount.toString();
  const totalSpentStr = totalSpent.toString();

  const nameFieldLength = language === 'en' ? NAME_FIELD_LENGTH_EN : NAME_FIELD_LENGTH_JP;
  const productAmountFieldLength = language === 'en' ? PRODUCT_AMOUNT_FIELD_EN : PRODUCT_AMOUNT_FIELD_JP;
  const totalSpentFieldLength = language === 'en' ? TOTAL_SPENT_FIELD_EN : TOTAL_SPENT_FIELD_JP;

  const usernameField = (username.length > nameFieldLength)
    ? `${username.slice(0, nameFieldLength - 1)}..│`
    : username;
  const productAmountField = (productAmountStr.length > productAmountFieldLength)
    ? ` ${productAmountStr.slice(0, productAmountFieldLength - 3)}..│`
    : ` ${productAmountStr}${" ".repeat(productAmountFieldLength + 1 - productAmountStr.length)}│`
  const totalSpentField = (totalSpentStr.length > totalSpentFieldLength)
    ? ` ${totalSpentStr.slice(0, totalSpentFieldLength - 3)}..`
    : ` ${totalSpentStr}${" ".repeat(totalSpentFieldLength + 1 - totalSpentStr.length)}`
  return `${usernameField}${productAmountField}${totalSpentField}`;
}
