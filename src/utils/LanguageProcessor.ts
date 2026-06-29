import { getLogger } from "../index.ts";
import fs from "fs";
import path from "path";

const AVAILABLE_LANGUAGES = { en: true, jp: true };

export class LanguageProcessor {
  private userLanguage: string = "en";
  private languageKeyCache: Map<string, string> = new Map();

  constructor() {
    this.loadLanguageKeys();
  }

  public setUserLanguage(userLanguage: string): void {
    this.userLanguage = userLanguage;
  }

  public getUserLanguage(): string {
    return this.userLanguage;
  }

  public getTranslation(languageKey: string): string {
    const translation = this.languageKeyCache.get(languageKey);
    if (translation === undefined) {
      const err = new Error(`Failed to locate language key: ${languageKey}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
    return translation;
  }

  private loadLanguageKeys() {
    Object.keys(AVAILABLE_LANGUAGES).forEach((lang) => {
      try {
        const languageData = fs.readFileSync(
          `${path.resolve(process.cwd(), "public")}/languages/${lang}.json`,
          "utf8",
        );
        for (const [k, v] of Object.entries(JSON.parse(languageData))) {
          if (typeof v !== "string") {
            throw Error("Provided value isn't a string");
          } else {
            this.languageKeyCache.set(k, v);
          }
        }
      } catch (e) {
        getLogger().log({
          level: "error",
          message: `Failed to parse language keys for language: ${lang}\n Error: ${e}`,
          exitOnError: true,
        });
      }
    });
  }
}
