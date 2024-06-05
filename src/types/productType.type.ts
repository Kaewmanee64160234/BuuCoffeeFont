import type { Product } from "./product.type";
import type { Recipe } from "./recipe.type";

export interface ProductType {
    productTypeId?: number;
    productTypeName: string;
    productTypePrice: number;
    selectedIngredients?: number[];
    ingredientQuantities?: IngredientQuantities;
    product?:Product;
    recipe?: Recipe[];

}
interface IngredientQuantities {
    [key: number]: number;
  }

  