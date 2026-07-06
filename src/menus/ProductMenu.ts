import { number, select } from "@inquirer/prompts";
import { getLanguageHandler } from "../index.ts";
import {
  VENDING_MACHINE_THEME,
  type VendingMachine,
} from "../utils/VendingMachine.ts";
import { displayErrorProceedMenu } from "./ErrorMenu.ts";
import { displayStartMenu } from "./StartMenu.ts";

export type ProductOption = {
  name: string;
  value: number;
};

const PRODUCT_OPTIONS = {
  RETURN: -1,
};

export async function displayProductMenu(vendingMachine: VendingMachine) {
  const languageHandler = getLanguageHandler();
  const productOptions: ProductOption[] = [];

  vendingMachine.getProductData().forEach((data, key) => {
    productOptions.push({
      name: `${data.product_name} : ¥${data.product_price}`,
      value: key,
    });
  });

  const selectedOption = await select(
    {
      message: languageHandler.getTranslation("menu.products.prompt"),
      choices: [
        ...productOptions,
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
  if (selectedOption === PRODUCT_OPTIONS.RETURN) {
    await displayStartMenu(vendingMachine);
    return;
  }
  await selectProductCountMenu(vendingMachine, selectedOption);
}

async function selectProductCountMenu(
  vendingMachine: VendingMachine,
  productId: number,
) {
  const productData = vendingMachine.getProductData().get(productId);
  if (productData === undefined) {
    await displayErrorProceedMenu(
      getLanguageHandler().getTranslation("menu.products.invalid_product"),
    );
    await displayProductMenu(vendingMachine);
    return;
  }
  const languageHandler = getLanguageHandler();
  const discountPrice = Math.round(
    productData.discount_condition * productData.product_price -
      (productData.discount_condition *
        productData.product_price *
        productData.discount_amount) /
        100,
  );
  const productAmount = await number(
    {
      message: `\n${languageHandler.getTranslation("menu.products.name")}: ${productData.product_name}\n${languageHandler.getTranslation("menu.products.description")}: ${productData.product_description}\n1x: ¥${productData.product_price}\n${productData.discount_condition}x: ¥${discountPrice} [-%${productData.discount_amount}]\n\n${languageHandler.getTranslation("menu.products.prompt.amount")}`,
      required: true,
      validate: function (v) {
        return Number.isSafeInteger(v)
          ? true
          : languageHandler.getTranslation("menu.products.invalid_input");
      },
      theme: VENDING_MACHINE_THEME,
    },
    { clearPromptOnDone: true },
  );
  if (productAmount <= 0) {
    await displayProductMenu(vendingMachine);
    return;
  }

  // Remove the whole logic and implement in checking out process, this was supposed to be validated in the shopping card.

  const finalPrice =
    productAmount >= productData.discount_condition
      ? productData.product_price * productAmount -
        (productData.product_price *
          productAmount *
          productData.discount_amount) /
          100
      : productAmount * productData.product_price;
  const user = vendingMachine.getUser();
  if (finalPrice > user.getBalance() || !user.removeBalance(finalPrice)) {
    await displayErrorProceedMenu(
      getLanguageHandler().getTranslation("menu.products.insufficient_balance"),
    );
    await displayProductMenu(vendingMachine);
    return;
  }
  await displayProductMenu(vendingMachine);
  return;
}
