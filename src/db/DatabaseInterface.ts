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
      this.db.pragma("journal_mode = WAL;");
      this.db.pragma("foreign_keys = ON;");
      this.createDatabaseSchema();
      this.loadProducts();
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
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(16) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS user_balances (
        balance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE REFERENCES user_data(user_id) ON DELETE CASCADE,
        balance INTEGER DEFAULT 10000 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS user_statistics (
        statistic_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE REFERENCES user_data(user_id) ON DELETE CASCADE,
        product_amount INTEGER DEFAULT 0 NOT NULL,
        spent_amount INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS product_data (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT ,
        product_name VARCHAR(128) NOT NULL,
        product_description VARCHAR(256) NOT NULL,
        product_price INTEGER NOT NULL,
        discount_condition INTEGER DEFAULT 0 NOT NULL,
        discount_amount INTEGER DEFAULT 0 NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS shopping_carts (
        cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE REFERENCES user_data(user_id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS shopping_cart_items (
        cart_id INTEGER NOT NULL REFERENCES shopping_carts(cart_id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES product_data(product_id),
        amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
        PRIMARY KEY (cart_id, product_id)
      );`,
      `
      CREATE TRIGGER IF NOT EXISTS create_user_defaults
      AFTER INSERT ON user_data
      BEGIN
          INSERT INTO user_balances (user_id)
          VALUES (NEW.user_id);
          INSERT INTO user_statistics (user_id)
          VALUES (NEW.user_id);
          INSERT INTO shopping_carts (user_id)
          VALUES (NEW.user_id);
      END;
      `,
    ];
    this.db.transaction(() => {
      for (const sql of statements) {
        this.db.prepare(sql).run();
      }
    })();
  }

  private loadProducts() {
    const productQuery = this.db.prepare(
      "INSERT INTO product_data VALUES (null, @product_name, @product_description, @product_price, @discount_condition, @discount_amount)",
    );
    const insertionStmt = this.db.transaction((products) => {
      for (const product of products) productQuery.run(product);
    });
    insertionStmt([
      {
        product_name: "ハンバーガー",
        product_description: "マックドナルドのハンバーガー、美味しそうよ",
        product_price: 1000,
        discount_condition: 5,
        discount_amount: 10,
      },
      {
        product_name: "リンゴジュース",
        product_description: "すごくヘルシー！",
        product_price: 2500,
        discount_condition: 2,
        discount_amount: 20,
      },
    ]);
  }

  public getDatabase() {
    return this.db;
  }
}
