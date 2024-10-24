import type { Ingredient } from "../ingredient.type";
import type { Product } from "../product.type";
import type { Receipt, ReceiptItem } from "../receipt.type";

export interface Meal {
  mealName: string;
  totalPrice: number;
  mealTime: string;
  cateringEventId: number;
  mealProducts: MealProduct[];
  receipt: Receipt; // One receipt for either rice or coffee in this meal

}
export interface MealProduct {
  mealId: number;
  product: Product;
  quantity: number;
  totalPrice: number;
  type: string; // riceShop coffeeShop
}

 