export interface Ingredient {
  IngredientId?: number; // ไม่เก็บ
  IngredientImage?: string;
  nameIngredient?: string;
  supplier?: string;
  minimun: number;
  unit?: string;
  quantityInStock: number; // ไม่เก็บ
  quantityPerUnit?: number;
  files: any;
}
