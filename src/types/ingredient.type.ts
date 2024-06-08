export interface Ingredient {
  ingredientId?: number; // ไม่เก็บ
  igredientImages?: string;
  ingredientName?: string;
  igredientSupplier?: string;
  igredientMinimun: number;
  igredientUnit?: string;
  igredientQuantityInStock: number; // ไม่เก็บ
  igredientQuantityPerUnit?: number;
  igredientQuantityPerSubUnit?: string;
  igredientRemining?: number;
  files: any;
}
