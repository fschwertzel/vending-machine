import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { getLanguageProcessor, getLogger } from "../index.ts";
import { validateUsername } from "./Authentication.ts";

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
  constructor() {
    this.selectLanguage();
  }

  public async selectLanguage(): Promise<void> {
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
      getLanguageProcessor().setUserLanguage(selectedLanguage);
      console.log(
        `${WELCOME_ASCII}\n𖠌 : ` +
          getLanguageProcessor().getTranslation("welcome.message"),
      );
      await this.fetchUserName();
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

  public async fetchUserName(): Promise<void> {
    const username = await input(
      {
        message: getLanguageProcessor().getTranslation("auth.prompt"),
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
    console.log(username);
  }
}
