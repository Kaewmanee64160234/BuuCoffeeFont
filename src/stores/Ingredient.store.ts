import { ref } from 'vue';
import axios from 'axios';
import { defineStore } from 'pinia';
import type { Ingredient } from '@/types/ingredient.type';
import ingredientService from '@/service/ingredient.service';

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredient = ref<Ingredient | null>(null);
  const ingredients = ref<Ingredient[]>([]);


  const getAllIngredients = async () => {
    try {
      const response = await ingredientService.getAllIngredients();
      if (response.status === 200) {
        console.log('getAllIngredients', response.data);
        ingredients.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    ingredient,
    ingredients,
    getAllIngredients,
  };
});
