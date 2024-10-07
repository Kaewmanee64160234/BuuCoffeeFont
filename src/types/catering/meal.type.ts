import type { Ingredient } from "../ingredient.type";

export interface Meal {
    mealName: string;
    totalPrice: number;
    mealTime: string;
    cateringEventId: number;
    mealIngredient: MealIngredient[];
    
 }
 export interface MealIngredient {
    mealId: number;
    ingredient: Ingredient;
    quantity: number;
    totalPrice: number;
    type: string; // riceShop coffeeShop

 }