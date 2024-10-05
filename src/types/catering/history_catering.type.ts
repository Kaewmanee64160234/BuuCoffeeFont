

export interface HistoryMealIngredient {
    mealIngredientId: number;
    quantity: number;
    totalPrice: number;
    type: string;
  }
  
  export interface HistoryMeal {
    mealId: number;
    mealName: string;
    totalPrice: number;
    mealTime: string; 
    mealIngredients: HistoryMealIngredient[];
  }
  
  export interface CateringUser {
    userId: number;
    userName: string; 
  }
  
  export interface HistoryCateringEvent {
    eventId: number;
    eventName: string;
    eventDate: string;
    eventLocation: string;
    attendeeCount: number;
    totalBudget: number;
    status: 'pending' | 'paid' | 'canceled'; 
    meals: HistoryMeal[];
    user: CateringUser; 
    createdDate: string; 
    updatedDate: string; 
  }
  