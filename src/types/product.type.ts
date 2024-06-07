import type { Category } from "./category.type";
import type { ProductType } from "./productType.type";

export interface Product {
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  category: Category;
  productTypes?: ProductType[];
}
export function mapToProduct(data: any): Product {
  return {
    productId: data.productId,
    productName: data.productName,
    productImage: data.productImage,
    productPrice: data.productPrice,
    category: data.category,
    productTypes: data.productTypes ? data.productTypes.map((productType: any) => {
      return {
        productTypeId: productType.productTypeId,
        productTypeName: productType.productTypeName,
        productTypePrice: productType.productTypePrice,
        selectedIngredients: productType.selectedIngredients,
        ingredientQuantities: productType.ingredientQuantities,
        product: productType.product,
        recipes: productType.recipes ? productType.recipes.map((recipe: any) => {
          return {
            recipeId: recipe.recipeId,
            quantity: recipe.quantity,
            ingredient: recipe.ingredient ? {
              IngredientId: recipe.ingredient.IngredientId,
              nameIngredient: recipe.ingredient.nameIngredient,
              IngredientImage: recipe.ingredient.IngredientImage,
              supplier: recipe.ingredient.supplier,
              minimum: recipe.ingredient.minimun,
              unit: recipe.ingredient.unit,
              quantityInStock: recipe.ingredient.quantityInStock,
              quantityPerUnit: recipe.ingredient.quantityPerUnit,
            } : null,
          };
        }) : [],
      };
    }) : [],
  };
}
