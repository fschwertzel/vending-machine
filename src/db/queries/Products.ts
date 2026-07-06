import { getDatabaseInterface } from "../../index.ts";

export type ProductResult = {
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: number;
  discount_condition: number;
  discount_amount: number;
};

export type ProductData = {
  product_name: string;
  product_description: string;
  product_price: number;
  discount_condition: number;
  discount_amount: number;
};

export function selectAllProductData(): ProductResult[] | undefined {
  const db = getDatabaseInterface().getDatabase();
  const stmt = db.prepare("SELECT * FROM product_data;");
  return stmt.all() as ProductResult[] | undefined;
}
