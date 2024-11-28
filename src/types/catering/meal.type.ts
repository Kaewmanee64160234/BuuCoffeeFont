import type { Ingredient } from "../ingredient.type";
import type { Product } from "../product.type";
import type { Receipt, ReceiptItem } from "../receipt.type";

export interface Meal {
  mealName: string;
  description: string;
  totalPrice: number;
  mealTime: string;
  cateringEventId: number;
  mealProducts: MealProduct[];
  coffeeReceiptId?: number;
  riceReceiptId?: number;
  receipt?: Receipt;
  riceReceipt?: Receipt; // One receipt for either rice or coffee in this meal
  coffeeReceipt?: Receipt;
}
export interface MealProduct {
  mealId: number;
  product?: Product;
  productName?: string;
  productPrice?: number;
  quantity: number;
  totalPrice: number;
  type: string;
  receiptItems?: ReceiptItem[];
  receiptItemIds?: number[];
}
