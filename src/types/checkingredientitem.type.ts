import type { Ingredient } from "./ingredient.type";
import type { User } from "./user.type";

export interface  Checkingredientitem {
    CheckIngredientsItemID: number;
    UsedQuantity: number;
    oldRemain: number;
    checkingredient: Checkingredient;
    ingredient: Ingredient;
    type?: string;
    lastPrice?: number;
  }

  export interface  Checkingredient {
  CheckID: number;
  date: Date;
  actionType: String;
  checkDescription: String;
  user: User;
  checkingredientitem: Checkingredientitem[];
  totalPrice?: number;
}
