import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { getLanguageHandler, getLogger } from "../index.ts";
import {
  getUserData,
  validateUsername,
} from "../handlers/AuthenticationHandler.ts";
import { User } from "./User.js";

const VENDING_MACHINE_THEME = { prefix: "𖠌 :" };
const WELCOME_ASCII = `
  　　　|　　|┌─────────────┐|
  　　　|　　|│![] [] [] [] │|
  　　　|　　|::l三三三三三!.|
  　　　|　　|│![] [] [] [] │|
  　　　|　　|::l三三三三三!.|
  　　　|　　|┌─────────────┐|　いらっしゃいませ！　  /ヽ,/ヽ
  　　　|　　|│＿＿_＿＿_＿＿_│ 　 　　              (　　  ）　こんにちは!
  　　　{二二}￣￣￣￣￣￣￣￣　　　　　　　　　　　 と 　  i
  　　　　　　　　　　　　　　　　　　　　　　      　 しーJ
`;

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
        `${WELCOME_ASCII}\n𖠌 : ` +
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

  private async displayStartMenu() {
    console.log(`Welcome, ${this.currentUser?.getUsername().toString()}`);
  }
}
