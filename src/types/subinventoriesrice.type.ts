import type { Ingredient } from "./ingredient.type";

export interface SubInventoriesRice{
    subInventoryId: number;
    ingredient: Ingredient;
    quantity: number;
    reservedQuantity?:number;


}