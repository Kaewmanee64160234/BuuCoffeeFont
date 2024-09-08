import type { Category } from "./category.type";
import type { ProductType } from "./productType.type";

export interface Product {
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  countingPoint:boolean;
  storeType: string;
  barcode:string;
  haveTopping: boolean;
  category: Category;
  productTypes?: ProductType[];
}
export function mapToProduct(data: any): Product {
  return {
    productId: data.productId,
    storeType: data.storeType,
    productName: data.productName,
    productImage: data.productImage,
    productPrice: data.productPrice,
    countingPoint: data.countingPoint,  
    haveTopping: data.haveTopping,
    barcode: data.barcode,
    category: data.category,
    productTypes: data.productTypes ? data.productTypes.map((productType: any) => {
      return {
        productTypeId: productType.productTypeId,
        productTypeName: productType.productTypeName,
        productTypePrice: productType.productTypePrice,
        selectedIngredients: productType.selectedIngredients,
        disable: productType.disable,
        
        ingredientQuantities: productType.ingredientQuantities,
        product: productType.product,
        recipes: productType.recipes ? productType.recipes.map((recipe: any) => {
          return {
            recipeId: recipe.recipeId,
            quantity: recipe.quantity,
            ingredient: recipe.ingredient ? {
              IngredientId: recipe.ingredient.ingredientId,
              nameIngredient: recipe.ingredient.ingredientName,
              IngredientImage: recipe.ingredient.ingredientImage,
              supplier: recipe.ingredient.ingredientSupplier,
              minimum: recipe.ingredient.ingredientMinimun,
              unit: recipe.ingredient.ingredientUnit,
              quantityInStock: recipe.ingredient.ingredientQuantityInStock,

              quantityPerUnit: recipe.ingredient.ingredientQuantityPerUnit,
            } : null,
          };
        }) : [],
      };
    }) : [],
  };
}
