import { getLogger } from "../index.ts";
import fs from "fs";
import path from "path";

const AVAILABLE_LANGUAGES = { en: true, jp: true };

export class LanguageHandler {
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

  public getTranslation(
    languageKey: string,
    inserts: Array<string> = [],
    time_based: boolean = false,
  ): string {
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
    if (time_based) {
      languageKey += `_${this.getCurrentDaytimeChar()}`;
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
    if (inserts.length === 0) {
      return translation;
    }
    let pos = 0;
    return translation.replace(/%/g, () => inserts[pos++] ?? "-");
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

  private getCurrentDaytimeChar(): string {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 12) {
      return "m";
    } else if (hours >= 12 && hours < 17) {
      return "a";
    }
    return "e";
  }
}
