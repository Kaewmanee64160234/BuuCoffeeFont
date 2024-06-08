export interface Ingredient {
  ingredientId?: number; // ไม่เก็บ
  ingredientImages?: string;
  ingredientName?: string;
  ingredientSupplier?: string;
  ingredientMinimun: number;
  ingredientUnit?: string;
  ingredientQuantityInStock: number; // ไม่เก็บ
  ingredientQuantityPerUnit?: number;
  ingredientQuantityPerSubUnit?: string;
  ingredientRemining?: number;
  files: any;
}
