import { getDatabaseInterface } from "../../index.ts";

export type ShoppingCartId = {
  cart_id: number;
};

export type ShoppingCartResult = {
  product_id: number;
  amount: number;
};
export type ShoppingCartData = Map<number, number>;


export function selectShoppingCartId(
  userId: number,
):  number | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `SELECT cart_id
    FROM shopping_carts
    WHERE user_id = ?`,
  );
  const res = stmt.get(userId) as ShoppingCartId | undefined;
  return res ? res.cart_id : undefined;
}

export function selectShoppingCart(
  cartId: number,
): ShoppingCartResult[] | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(`
    SELECT product_id, amount
    FROM shopping_cart_items
    WHERE cart_id = ?`
  );
  const res = stmt.all(cartId) as ShoppingCartResult[] | undefined;
  return res;
}

export function selectShoppingCartItem(
  cartId: number,
  productId: number,
): ShoppingCartResult | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `SELECT amount
    FROM shopping_cart_items
    WHERE cart_id = ?
    AND product_id = ?`,
  );
  return stmt.get(cartId, productId) as ShoppingCartResult | undefined;
}

export function setShoppingCartItem(
  cartId: number,
  productId: number,
  amount: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `INSERT INTO shopping_cart_items (cart_id, product_id, amount)
    VALUES (?, ?, ?)
    ON CONFLICT(cart_id, product_id)
    DO UPDATE SET amount = ?;`,
  );
  return stmt.run(cartId, productId, amount, amount).changes > 0;
}

export function updateShoppingCartItem(
  cartId: number,
  productId: number,
  amount: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `UPDATE shopping_cart_items SET amount = ? WHERE cart_id = ? AND product_id = ?`,
  );
  return stmt.run(amount, cartId, productId).changes > 0;
}

export function deleteShoppingCartItem(
  cartId: number,
  productId: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `DELETE FROM shopping_cart_items WHERE cart_id = ? AND product_id = ?`,
  );
  return stmt.run(cartId, productId).changes > 0;
}

export function clearShoppingCartItems(
  cartId: number,
): boolean {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare(
    `DELETE FROM shopping_cart_items WHERE cart_id = ?`,
  );
  return stmt.run(cartId).changes > 0;
}
