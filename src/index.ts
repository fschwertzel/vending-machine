import "dotenv/config";
import winston, { Logger } from "winston";
import { VendingMachine } from "./utils/VendingMachine.ts";
import { LanguageProcessor } from "./utils/LanguageProcessor.ts";

const LOGGER = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "runtime_errors.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "runtime_information.log",
      level: "info",
    }),
  ],
});
const LANGUAGE_PROCESSOR = new LanguageProcessor();

export function getLogger(): Logger {
  return LOGGER;
}

export function getLanguageProcessor(): LanguageProcessor {
  return LANGUAGE_PROCESSOR;
}

new VendingMachine();
