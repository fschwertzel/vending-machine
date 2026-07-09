import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { getLanguageHandler, getLogger } from "../index.ts";
import {
  getUserData,
  validateUsername,
} from "../handlers/AuthenticationHandler.ts";
import { User } from "./User.ts";
import { displayStartMenu } from "../menus/StartMenu.ts";
import {
  selectAllProductData,
  type ProductData,
} from "../db/queries/Products.ts";
import { selectShoppingCart } from "../db/queries/ShoppingCarts.ts";
import { ShoppingCart } from "./ShoppingCart.js";

export const VENDING_MACHINE_THEME = { prefix: "𖠌 :" };
const CLEAR_CODE = "\u001b[2J\u001b[0;0H\n";

export class VendingMachine {
  currentUser: User | undefined = undefined;
  productDataCache: Map<number, ProductData> = new Map<number, ProductData>();
  shoppingCart: ShoppingCart | undefined = undefined;

  public static async create(): Promise<VendingMachine> {
    const vm = new VendingMachine();
    vm.loadProductData();
    await vm.selectLanguage();
    return vm;
  }

  private async selectLanguage(): Promise<void> {
    try {
      const selectedLanguage = await select(
        {
          message: "Select a language",
          choices: [
            { name: "English", value: "en" },
            { name: "日本語", value: "jp" },
          ],
          theme: VENDING_MACHINE_THEME,
        },
        { clearPromptOnDone: true },
      );
      getLanguageHandler().setUserLanguage(selectedLanguage);
      await this.selectUser();
    } catch (e) {
      const err = new Error(`Failed to set the user's language: ${e}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
  }

  private async selectUser(): Promise<void> {
    const languageHandler = getLanguageHandler();
    console.log(
      languageHandler.getTranslation("welcome.ascii") +
        "\n𖠌 : " +
        languageHandler.getTranslation("welcome.message"),
    );
    const username = await input(
      {
        message: languageHandler.getTranslation("auth.prompt"),
        theme: VENDING_MACHINE_THEME,
        required: true,
        default: "morinawa_mikuri",
        validate: function (userInput) {
          return validateUsername(userInput);
        },
      },
      { clearPromptOnDone: true },
    ).catch((e) => {
      const err = new Error(`Failed to fetch user's username: ${e}`);
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    });
    this.clearScreen();
    this.currentUser = new User(getUserData(username));
    this.loadShoppingCart();
    await displayStartMenu(this);
  }

  public getUser(): User {
    if (this.currentUser !== undefined) {
      return this.currentUser;
    }
    const err = new Error(`Failed to fetch the current user.`);
    getLogger().log({
      level: "error",
      message: err.message,
      exitOnError: true,
    });
    throw err;
  }

  private loadProductData() {
    const productData = selectAllProductData();
    if (productData === undefined) {
      getLogger().log({
        level: "info",
        message:
          "No products have been loaded into the cache, what are you trying to sell exactly?",
      });
      return;
    }
    productData.forEach((product) => {
      this.productDataCache.set(product.product_id, {
        product_name: product.product_name,
        product_description: product.product_description,
        product_price: product.product_price,
        discount_condition: product.discount_condition,
        discount_amount: product.discount_amount,
      });
    });
  }

  private loadShoppingCart() {
    this.shoppingCart = new ShoppingCart(this);
    const cartData = selectShoppingCart(this.getUser().getUserID());
    if (cartData === undefined) {
      getLogger().log({
        level: "info",
        message:
          "No shopping cart data found for the current user, not a big spender eh?",
      });
      return;
    }
    cartData.forEach((product) => {
      this.getShoppingCart().addProduct(product.product_id, product.amount);
    });
  }

  public getProductDataCache(): Map<number, ProductData> {
    return this.productDataCache;
  }

  public getShoppingCart(): ShoppingCart {
    if (this.shoppingCart !== undefined) {
        return this.shoppingCart;
    } else {
      const err = new Error("Tried to access shopping cart before initialization.");
      getLogger().log({
        level: "error",
        message: err.message,
        exitOnError: true,
      });
      throw err;
    }
  }

  public clearScreen() {
    process.stdout.write(CLEAR_CODE);
  }
}
