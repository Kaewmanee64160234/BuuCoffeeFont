import type { Importingredient } from "./importIngredient.type";
import type { Ingredient } from "./ingredient.type";

export interface Importingredientitem {
  importIngredientsItemID?: number;
  pricePerUnit?: number;
  unitPrice?: number;
  Quantity?: number;
  name?: String;
  importType?: 'piece' | 'box';
  importingredient?: Importingredient;
  ingredient?: Ingredient; // Ingredient Id
}
