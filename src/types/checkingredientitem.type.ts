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
  user: User;
  checkingredientitem: Checkingredientitem[];
}
