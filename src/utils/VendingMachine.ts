import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { getLanguageHandler, getLogger } from "../index.ts";
import {
  getUserData,
  validateUsername,
} from "../handlers/AuthenticationHandler.ts";
import { User } from "./User.ts";
import { displayStartMenu } from "../menus/StartMenu.ts";

export const VENDING_MACHINE_THEME = { prefix: "𖠌 :" };
const CLEAR_CODE = "\u001b[2J\u001b[0;0H\n";

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
    const languageHandler = getLanguageHandler();
    console.log(
      languageHandler.getTranslation("welcome.ascii") +
        "\n𖠌 : " +
        languageHandler.getTranslation("welcome.message"),
    );
    const username = await input(
      {
        message: languageHandler.getTranslation("auth.prompt"),
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
    this.clearScreen();
    this.currentUser = new User(getUserData(username));
    await displayStartMenu(this);
  }

  public getUser(): User {
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

  public clearScreen() {
    process.stdout.write(CLEAR_CODE);
  }
}
