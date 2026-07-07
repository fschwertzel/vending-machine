import {
  addShoppingCartItem,
  deleteShoppingCartItem,
  updateShoppingCartItem,
  type ShoppingCartData,
} from "../db/queries/ShoppingCarts.ts";
import type { VendingMachine } from "./VendingMachine.ts";

export class ShoppingCart {
  vendingMachine: VendingMachine;
  constructor(vendingMachine: VendingMachine) {
    this.vendingMachine = vendingMachine;
  }
  cartData: ShoppingCartData = new Map<number, number>();

  public getCartData(): ShoppingCartData {
    return this.cartData;
  }

  public getProductAmount(productId: number): number {
    return this.cartData.get(productId) ?? 0;
  }

  public addProduct(productId: number, productAmount: number): boolean {
    if (this.getProductAmount(productId) > 0) {
      return this.updateProduct(productId, productAmount);
    }
    const success = addShoppingCartItem(
      this.vendingMachine.getUser().getUserID(),
      productId,
      productAmount,
    );
    if (success) {
      this.cartData.set(productId, productAmount);
      return true;
    }
    return false;
  }

  public updateProduct(productId: number, productAmount: number): boolean {
    const currentProductAmount = this.getProductAmount(productId);
    if (currentProductAmount === 0) {
      return this.addProduct(productId, productAmount);
    }
    const success = updateShoppingCartItem(
      this.vendingMachine.getUser().getUserID(),
      productId,
      currentProductAmount + productAmount,
    );
    if (success) {
      this.cartData.set(productId, productAmount);
      return true;
    }
    return false;
  }

  public removeProduct(productId: number): boolean {
    const success = deleteShoppingCartItem(
      this.vendingMachine.getUser().getUserID(),
      productId,
    );
    if (success) {
      this.cartData.delete(productId);
      return true;
    }
    return false;
  }
}
