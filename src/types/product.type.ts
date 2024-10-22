import type { Category } from "./category.type";
import type { ProductTypeTopping } from "./productTypeTopping.type";
import type { Recipe } from "./recipe.type";

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
  sweetnessLevel?: number;
  productTypeToppings?: ProductTypeTopping[];
  quantity?: number;
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
    sweetnessLevel: data.sweetnessLevel,
    productTypeToppings: data.productTypeToppings ? data.productTypeToppings.map((ptt: any) => {
      return {
        productTypeToppingId: ptt.productTypeToppingId,
        topping: ptt.topping,
        quantity: ptt.quantity,
      };
    }) : [],
  };
}
export interface ProductType {
  productTypeId?: number;
  productTypeName: string;
  productTypePrice: number;
  recipes?: Recipe[];
}