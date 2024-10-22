import type { Ingredient } from "../ingredient.type";
import type { Product } from "../product.type";

export interface Meal {
    mealName: string;
    totalPrice: number;
    mealTime: string;
    cateringEventId: number;
    mealProducts: MealProduct[];
    
 }
 export interface MealProduct {
    mealId: number;
    product: Product;
    quantity: number;
    totalPrice: number;
    type: string; // riceShop coffeeShop

 }