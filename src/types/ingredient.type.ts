export interface Ingredient {
  IngredientId: number;
  IngredientImage?: string;
  nameIngredient?: string;
  supplier?: string;
  minimun: number;
  unit?: string;
  quantityInStock: number;
  quantityPerUnit?: number;
}
