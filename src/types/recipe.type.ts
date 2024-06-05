import type { Ingredient } from "./ingredient.type";

export interface Recipe {
  recipeId?: number;
  ingredient: Ingredient;
  quantity: number;
}
