import { select } from "@inquirer/prompts";
import { getLanguageHandler } from "../index.ts";
import {
  VENDING_MACHINE_THEME,
  type VendingMachine,
} from "../utils/VendingMachine.ts";
import { displayErrorProceedMenu } from "./ErrorMenu.ts";
import { displayStartMenu } from "./StartMenu.ts";
import type { ShoppingCartData } from "../db/queries/ShoppingCarts.ts";
import type { ProductData } from "../db/queries/Products.ts";
import { setUserStatistics } from "../db/queries/Statistics.ts";

export type CartOption = {
  name: string;
  value: number;
};

const SHOPPING_CART_OPTIONS = {
  CHECKOUT: -1,
  RETURN: -2,
};

const PRODUCT_OPTIONS = {
  ADD: 0,
  REMOVE: 1,
  REMOVE_ALL: 2,
  RETURN: 3,
};

export async function displayShoppingCartMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();

  const productCache = vendingMachine.getProductDataCache();
  const cartData: ShoppingCartData = vendingMachine
    .getShoppingCart()
    .getCartData();
  const cartOptions: CartOption[] = [];

  let totalPrice = 0;
  let totalAmount = 0;
  for (const [id, amount] of cartData.entries()) {
    const productData = productCache.get(id);
    if (productData === undefined) {
      continue;
    }
    const price = getDiscountedPrice(productData, amount);
    totalPrice += price;
    totalAmount += amount;
    cartOptions.push({
      name: `${productData.product_name} (${amount}) ¥${price}`,
      value: id,
    });
  }
  if (cartOptions.length > 0) {
    cartOptions.push({
      name: `${languageHandler.getTranslation(
      "menu.shopping_cart.option.checkout",
    )} (¥${totalPrice})`,
      value: SHOPPING_CART_OPTIONS.CHECKOUT
    });
  }

  const selectedOption = await select(
    {
      message: languageHandler.getTranslation("menu.shopping_cart.prompt"),
      choices: [
        ...cartOptions,
        {
          name: languageHandler.getTranslation("menu.start.option.return"),
          value: SHOPPING_CART_OPTIONS.RETURN,
        },
      ],
      pageSize: 10,
      theme: VENDING_MACHINE_THEME,
      loop: false,
    },
    { clearPromptOnDone: true },
  );
  if (selectedOption === SHOPPING_CART_OPTIONS.RETURN) {
    await displayStartMenu(vendingMachine);
    return;
  } else if (selectedOption === SHOPPING_CART_OPTIONS.CHECKOUT) {
    const user = vendingMachine.getUser();
    if (user.getBalance() < totalPrice) {
      await displayErrorProceedMenu(languageHandler.getTranslation("menu.shopping_cart.insufficient_balance"));
      await displayShoppingCartMenu(vendingMachine);
      return;
    }
    if (!user.removeBalance(totalPrice) || !vendingMachine.getShoppingCart().checkoutProducts() || !setUserStatistics(user.getUserID(), totalAmount , totalPrice)) {
      await displayErrorProceedMenu(languageHandler.getTranslation("menu.shopping_cart.check_out.error"))
      return;
    }
    await displayStartMenu(vendingMachine);
    return;
  }
  await selectCartItemMenu(vendingMachine, selectedOption);
}

async function selectCartItemMenu(
  vendingMachine: VendingMachine,
  productId: number,
) {
  const productData = vendingMachine.getProductDataCache().get(productId);
  if (productData === undefined) {
    await displayErrorProceedMenu(
      getLanguageHandler().getTranslation("menu.products.invalid_product"),
    );
    await displayShoppingCartMenu(vendingMachine);
    return;
  }
  const languageHandler = getLanguageHandler();
  const cartData = vendingMachine.getShoppingCart();
  const productAmount = cartData.getProductAmount(productId);

  const totalPrice = productAmount * productData.product_price;
  const reducedPrice = getDiscountedPrice(productData, productAmount);

  const selectedOption = await select(
    {
      message: `\n${languageHandler.getTranslation("menu.products.name")}: ${productData.product_name}\n${languageHandler.getTranslation("menu.products.description")}: ${productData.product_description}\n${languageHandler.getTranslation("menu.products.amount")}: ${productAmount}\n${languageHandler.getTranslation("menu.products.price")}:  ¥${reducedPrice} ¥${getDiscountedString(totalPrice)} ${productAmount >= productData.discount_condition ? `[-%${productData.discount_amount}]` : ``}\n\n${languageHandler.getTranslation("menu.shopping_cart.selcted_item.prompt")}`,
      choices: [
        {
          name: languageHandler.getTranslation("menu.shopping_cart.option.add"),
          value: PRODUCT_OPTIONS.ADD,
        },
        {
          name: languageHandler.getTranslation(
            "menu.shopping_cart.option.remove",
          ),
          value: PRODUCT_OPTIONS.REMOVE,
        },
        {
          name: languageHandler.getTranslation(
            "menu.shopping_cart.option.remove_all",
          ),
          value: PRODUCT_OPTIONS.REMOVE_ALL,
        },
        {
          name: languageHandler.getTranslation("menu.start.option.return"),
          value: PRODUCT_OPTIONS.RETURN,
        },
      ],
      pageSize: 10,
      theme: VENDING_MACHINE_THEME,
      loop: false,
    },
    { clearPromptOnDone: true },
  );
  await handleCartItemOption(vendingMachine, selectedOption, productId);
}

export async function handleCartItemOption(
  vendingMachine: VendingMachine,
  option: number,
  productId?: number,
) {
  const shoppingCard = vendingMachine.getShoppingCart();
  switch (option) {
    case PRODUCT_OPTIONS.ADD:
      if (productId === undefined) {
        await displayErrorProceedMenu(
          getLanguageHandler().getTranslation("menu.products.invalid_product"),
        );
        await displayShoppingCartMenu(vendingMachine);
      } else {
        shoppingCard.addProduct(productId, 1);
        await selectCartItemMenu(vendingMachine, productId);
      }
      break;
    case PRODUCT_OPTIONS.REMOVE:
      if (productId === undefined) {
        await displayErrorProceedMenu(
          getLanguageHandler().getTranslation("menu.products.invalid_product"),
        );
        await displayShoppingCartMenu(vendingMachine);
      } else {
        const productAmount = shoppingCard.getProductAmount(productId);
        shoppingCard.updateProduct(
          productId,
          productAmount - 1,
        );
        if (productAmount - 1 > 0) {
          await selectCartItemMenu(vendingMachine, productId);
          break;
        } else {
          await displayShoppingCartMenu(vendingMachine);
        }
      }
      break;
    case PRODUCT_OPTIONS.REMOVE_ALL:
      if (productId === undefined) {
        await displayErrorProceedMenu(
          getLanguageHandler().getTranslation("menu.products.invalid_product"),
        );
      } else {
        shoppingCard.removeProduct(productId);
      }
      await displayShoppingCartMenu(vendingMachine);
      break;
    case PRODUCT_OPTIONS.RETURN:
      await displayShoppingCartMenu(vendingMachine);
      break;
    default:
      await displayShoppingCartMenu(vendingMachine);
      break;
  }
}

function getDiscountedString(before: number): string {
  const strikeThrough = "\u0336";
  return before
    .toString()
    .split("")
    .map((c) => c + strikeThrough)
    .join("");
}

function getDiscountedPrice(productData: ProductData, productAmount: number) {
  const totalPrice = productAmount * productData.product_price;
  return  Math.round(
    totalPrice -
      (productAmount >= productData.discount_condition
        ? (totalPrice * productData.discount_amount) / 100
        : 0),
  );
}
