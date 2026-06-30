import path from "path";
import Database from "better-sqlite3";
import { getLogger } from "../index.ts";

export class DatabaseInterface {
  private db: Database.Database;

  constructor() {
    try {
      this.db = new Database(
        `${path.resolve(process.cwd())}/vending_machine.db`,
        {
          readonly: false,
          fileMustExist: false,
          timeout: 5000,
        },
      );
      this.db.pragma("journal_mode = WAL");
      this.createDatabaseSchema();
    } catch (e) {
      const err = new Error(`Failed to initiate database interface: ${e}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
  }

  private createDatabaseSchema() {
    const statements = [
      `CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        username VARCHAR(16) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS user_balances (
        balance_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        user_id INTEGER NOT NULL REFERENCES user_data(user_id),
        balance INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS user_statistics (
        statistic_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        user_id INTEGER NOT NULL REFERENCES user_data(user_id),
        product_amount INTEGER DEFAULT 0 NOT NULL,
        spent_amount INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS product_data (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        product_name VARCHAR(128) NOT NULL,
        product_description VARCHAR(256) NOT NULL,
        stock_amount INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS shopping_cards (
        card_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        user_id INTEGER NOT NULL REFERENCES user_data(user_id),
        product_id INTEGER  NOT NULL REFERENCES product_data(product_id),
        amount INTEGER NOT NULL DEFAULT 1
      );`,
    ].map((sql) => this.db.prepare(sql));
    this.db.transaction(() => {
      for (const stmt of statements) {
        stmt.run();
      }
    })();
  }

  public getDatabase() {
    return this.db;
  }
}
