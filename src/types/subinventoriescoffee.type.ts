import type { Ingredient } from "./ingredient.type";

export interface SubInventoriesCoffee{
    subInventoryId: number;
    ingredient: Ingredient;
    quantity: number;
    type?:string;


}