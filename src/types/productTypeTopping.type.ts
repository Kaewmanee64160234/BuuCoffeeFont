import type { ProductType } from "./productType.type";
import type { Topping } from "./topping.type";

export interface ProductTypeTopping {
    productTypeToppingId: number;
    productType:ProductType;
    Topping: Topping;
    quantity: number;
    
    
}