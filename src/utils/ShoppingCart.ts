import {
  setShoppingCartItem,
  deleteShoppingCartItem,
  selectShoppingCartId,
  updateShoppingCartItem,
  type ShoppingCartData,
  clearShoppingCartItems,
} from "../db/queries/ShoppingCarts.ts";
import { getLogger } from "../index.ts";
import type { VendingMachine } from "./VendingMachine.ts";

export const MAX_PRODUCT_AMOUNT = 100;

export class ShoppingCart {
  cartId: number;
  vendingMachine: VendingMachine;
  cartData: ShoppingCartData = new Map<number, number>();

  constructor(vendingMachine: VendingMachine) {
    this.vendingMachine = vendingMachine;
    const cartId = selectShoppingCartId(vendingMachine.getUser().getUserID());
    if (cartId === undefined) {
      const err = new Error("Failed to retrieve user's cart id");
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
    this.cartId = cartId;
  }

  public getCartData(): ShoppingCartData {
    return this.cartData;
  }

  public getProductAmount(productId: number): number {
    return this.cartData.get(productId) ?? 0;
  }

  public addProduct(productId: number, productAmount: number): boolean {
    const currentProductAmount = this.getProductAmount(productId);
    if (currentProductAmount > 0) {
      return this.updateProduct(productId, Math.min(currentProductAmount + productAmount, MAX_PRODUCT_AMOUNT));
    }
    const success = setShoppingCartItem(
      this.cartId,
      productId,
      Math.min(productAmount, MAX_PRODUCT_AMOUNT),
    );
    if (success) {
      this.cartData.set(productId, Math.min(productAmount, MAX_PRODUCT_AMOUNT));
      return true;
    }
    return false;
  }

  public updateProduct(productId: number, productAmount: number): boolean {
    const currentProductAmount = this.getProductAmount(productId);
    if (currentProductAmount === 0) {
      return this.addProduct(productId, Math.min(productAmount, MAX_PRODUCT_AMOUNT));
    }
    if (productAmount === 0) {
      return this.removeProduct(productId);
    }
    const success = updateShoppingCartItem(
      this.cartId,
      productId,
      Math.min(currentProductAmount + productAmount, MAX_PRODUCT_AMOUNT)
    );
    if (success) {
      this.cartData.set(productId, Math.min(productAmount, MAX_PRODUCT_AMOUNT));
      return true;
    }
    return false;
  }

  public removeProduct(productId: number): boolean {
    const success = deleteShoppingCartItem(
      this.cartId,
      productId,
    );
    if (success) {
      this.cartData.delete(productId);
      return true;
    }
    return false;
  }

  public checkoutProducts(): boolean {
    const success = clearShoppingCartItems(this.cartId);
    if (success) {
      this.cartData.clear();
      return true;
    }
    return false;
  }
}
