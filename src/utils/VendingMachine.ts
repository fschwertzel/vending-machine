import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { getLanguageHandler, getLogger } from "../index.ts";
import {
  getUserData,
  validateUsername,
} from "../handlers/AuthenticationHandler.ts";
import { User } from "./User.ts";

const VENDING_MACHINE_THEME = { prefix: "𖠌 :" };

const START_MENU_OPTIONS = {
  BALANCE: 0,
};

export class VendingMachine {
  currentUser: User | undefined = undefined;

  public static async create(): Promise<VendingMachine> {
    const vm = new VendingMachine();
    await vm.selectLanguage();
    return vm;
  }

  private async selectLanguage(): Promise<void> {
    try {
      const selectedLanguage = await select(
        {
          message: "Select a language",
          choices: [
            { name: "English", value: "en" },
            { name: "日本語", value: "jp" },
          ],
          theme: VENDING_MACHINE_THEME,
        },
        { clearPromptOnDone: true },
      );
      getLanguageHandler().setUserLanguage(selectedLanguage);
      console.log(
        getLanguageHandler().getTranslation("welcome.ascii") +
          "\n𖠌 : " +
          getLanguageHandler().getTranslation("welcome.message"),
      );
      await this.selectUser();
    } catch (e) {
      const err = new Error(`Failed to set the user's language: ${e}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
  }

  private async selectUser(): Promise<void> {
    const username = await input(
      {
        message: getLanguageHandler().getTranslation("auth.prompt"),
        theme: VENDING_MACHINE_THEME,
        required: true,
        default: "morinawa_mikuri",
        validate: function (userInput) {
          return validateUsername(userInput);
        },
      },
      { clearPromptOnDone: true },
    ).catch((e) => {
      const err = new Error(`Failed to fetch user's username: ${e}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    });
    this.currentUser = new User(getUserData(username));
    await this.displayStartMenu();
  }

  private getUser(): User {
    if (this.currentUser !== undefined) {
      return this.currentUser;
    }
    const err = new Error(`Failed to fetch the current user.`);
    getLogger().log({
      level: "error",
      message: err.message,
      exitOnError: true,
    });
    throw err;
  }

  private async displayStartMenu() {
    const languageHandler = getLanguageHandler();
    const selectedOption = await select(
      {
        message: languageHandler.getTranslation(
          "menu.start.prompt",
          [this.getUser().getUsername()],
          true,
        ),
        choices: [
          {
            name: languageHandler.getTranslation("menu.start.option.balance"),
            value: START_MENU_OPTIONS.BALANCE,
          },
        ],
        theme: VENDING_MACHINE_THEME,
      },
      { clearPromptOnDone: true },
    );
  }

  private async handleUserChoice(choice: number) {
    switch (choice) {
      case START_MENU_OPTIONS.BALANCE:
        await this.displayBalanceMenu();
        break;
      default:
        this.displayBalanceMenu();
        break;
    }
  }

  private async displayBalanceMenu() {}
}
