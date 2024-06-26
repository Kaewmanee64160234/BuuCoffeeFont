import type { Importingredient } from "./importIngredient.type";
import type { Ingredient } from "./ingredient.type";

export interface Importingredientitem {
  importIngredientsItemID?: number;
  pricePerUnit?: number;
  Quantity?: number;
  importingredient?: Importingredient;
  ingredient?: Ingredient; // Ingredient Id
}
