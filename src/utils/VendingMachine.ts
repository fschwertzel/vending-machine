import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { LanguageProcessor } from "../utils/LanguageProcessor.ts";
import { getLogger } from "../index.ts";

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
  private languageProcessor: LanguageProcessor = new LanguageProcessor();
  constructor() {
    this.selectLanguage();
    this.fetchUserName();
  }

  public async selectLanguage(): Promise<void> {
    await select(
      {
        message: "Select a language",
        choices: [
          { name: "English", value: "en" },
          { name: "日本語", value: "jp" },
        ],
        theme: VENDING_MACHINE_THEME,
      },
      { clearPromptOnDone: true },
    )
      .then((res) => {
        this.languageProcessor.setUserLanguage(res);
        console.log(
          `${WELCOME_ASCII}\n𖠌 : ` +
            this.languageProcessor.getTranslation("welcome.message"),
        );
        this.fetchUserName();
      })
      .catch((e) => {
        const err = new Error(`Failed to set the user's language: ${e}`);
        getLogger().log({
          level: "error",
          message: err.message,
          exitOnError: true,
        });
        throw err;
      });
  }

  public async fetchUserName(): Promise<void> {
    const userName = await input(
      {
        message: this.languageProcessor.getTranslation("login.message"),
        theme: VENDING_MACHINE_THEME,
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
    console.log(userName);
  }
}
