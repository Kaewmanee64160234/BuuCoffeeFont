import type { Ingredient } from "./ingredient.type";
import type { User } from "./user.type";

export interface  Checkingredientitem {
    CheckIngredientsItemID: number;
    UsedQuantity: number;
    checkingredient: Checkingredient;
    ingredient: Ingredient;
  }

  export interface  Checkingredient {
  CheckID: number;
  date: Date;
  actionType: String;
  checkDescription: String;
  user: User;
  checkingredientitem: Checkingredientitem[];
}
