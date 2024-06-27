
export interface Ingredient {
  ingredientId?: number; 
  ingredientImage?: string;
  ingredientName?: string;
  ingredientSupplier?: string;
  ingredientMinimun: number;
  ingredientUnit?: string;
  ingredientQuantityInStock: number; 
  ingredientQuantityPerUnit?: number;
  ingredientQuantityPerSubUnit?: string;
  ingredientRemining?: number; 
  imageFile: File[]; 
}
