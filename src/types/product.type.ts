import type { Category } from "./category.type";
import type { ProductType } from "./productType.type";


export interface Product{
    productId: number;
    productName: string;
    productImage: string;
    productPrice: number;
    category: Category;
    productTypes?:ProductType[];
}