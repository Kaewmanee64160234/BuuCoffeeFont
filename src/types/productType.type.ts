import type { Product } from "./product.type";
import type { Recipe } from "./recipe.type";

export interface ProductType {
    productTypeId?: number;
    productTypeName: string;
    product?:Product;
    recipe?: Recipe[];

}