import type { Ingredient } from "./ingredient.type";
import type { ReceiptItem } from "./receipt.type";

export interface IngredientLog{
    id: number;  
    ingredient: Ingredient;
    recieptItem: ReceiptItem;
    usedQuantity: number;
    unit: number;
    createdAt: Date;
}