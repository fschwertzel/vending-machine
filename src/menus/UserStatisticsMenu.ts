import { select } from "@inquirer/prompts";
import { selectUserStatistics, type UserStatisticsResult } from "../db/queries/Statistics.ts";
import { getLanguageHandler } from "../index.ts";
import { VENDING_MACHINE_THEME, type VendingMachine } from "../utils/VendingMachine.ts";
import { displayStartMenu } from "./StartMenu.ts";


const STATISTIC_OPTIONS = {
  RETURN: 0
}

export async function displayUserStatisticsMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();

  const userStatisticData = selectUserStatistics();
  const userStatistics : string[]= [];

  if (userStatisticData !== undefined) {
    userStatisticData.forEach((data) => {
      userStatistics.push(`N: ${data.username} P: ${data.product_amount} S: ¥${data.spent_amount}\n`);
    });
  }

  const selectedOption = await select(
    {
      message: "Blah Blah User stats" + userStatistics.toString(),
      choices: [
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
  }
}
