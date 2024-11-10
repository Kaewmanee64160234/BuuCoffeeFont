import type { Ingredient } from "./ingredient.type";

export interface SubInventoriesCatering{
    subInventoryId: number;
    ingredient: Ingredient;
    quantity: number;
    type:string;
    reservedQuantity?:number;


}