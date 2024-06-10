import type { ProductType } from "./productType.type";
import type { Topping } from "./topping.type";

export interface ProductTypeTopping {
    productTypeToppingId?: number;
    productType: ProductType;
    topping: Topping;
    quantity: number;
    sweetness: number;
  }