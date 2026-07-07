import { getDatabaseInterface } from "../../index.ts";

export type ShoppingCartResult = {
  product_id: number;
  amount: number;
};
export type ShoppingCartData = Map<number, number>;

export function selectShoppingCart(
  userId: number,
): ShoppingCartResult[] | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    "SELECT product_id, amount FROM shopping_carts WHERE user_id = ?",
  );
  const res = stmt.all(userId) as ShoppingCartResult[] | undefined;
  return res;
}

export function selectShoppingCartItem(
  userId: number,
  productId: number,
): ShoppingCartResult | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `SELECT amount FROM shopping_carts WHERE user_id = ? AND product_id = ?`,
  );
  return stmt.get(userId, productId) as ShoppingCartResult | undefined;
}

export function addShoppingCartItem(
  userId: number,
  productId: number,
  amount: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `INSERT INTO shopping_carts (user_id, product_id, amount)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id)
    DO UPDATE SET amount = ?;`,
  );
  return stmt.run(userId, productId, amount, amount).changes > 0;
}

export function updateShoppingCartItem(
  userId: number,
  productId: number,
  amount: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `UPDATE shopping_carts SET amount = ? WHERE user_id = ? AND product_id = ?`,
  );
  return stmt.run(amount, userId, productId).changes > 0;
}

export function deleteShoppingCartItem(
  userId: number,
  productId: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `DELETE FROM shopping_carts WHERE user_id = ? AND product_id = ?`,
  );
  return stmt.run(userId, productId).changes > 0;
}
