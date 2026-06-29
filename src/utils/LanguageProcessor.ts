import { getLogger } from "../index.ts";
import fs from "fs";
import path from "path";

const AVAILABLE_LANGUAGES = { en: true, jp: true };

export class LanguageProcessor {
  private selectedLanguage: string = "en";
  private languageKeyCache: Map<string, Map<string, string>> = new Map<
    string,
    Map<string, string>
  >();

  constructor() {
    this.loadLanguageKeys();
  }

  public setUserLanguage(userLanguage: string): void {
    this.selectedLanguage = userLanguage;
  }

  public getUserLanguage(): string {
    return this.selectedLanguage;
  }

  public getTranslation(languageKey: string): string {
    const languageCache = this.languageKeyCache.get(this.selectedLanguage);
    if (languageCache === undefined) {
      const err = new Error(
        `Failed to retrieve language cache for: ${this.selectedLanguage}`,
      );
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
    const translation = languageCache.get(languageKey);
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
        this.languageKeyCache.set(lang, new Map<string, string>());
        const languageCache = this.languageKeyCache.get(lang);
        for (const [k, v] of Object.entries(JSON.parse(languageData))) {
          if (typeof v === "string") {
            languageCache?.set(k, v);
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
