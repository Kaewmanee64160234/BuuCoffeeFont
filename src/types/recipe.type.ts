import type { Ingredient } from "./ingredient.type";

export interface Recipe {
  recipeId: number;
  Ingredient: Ingredient;
  quantity: number;
}
