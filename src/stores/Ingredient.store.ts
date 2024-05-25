import { ref, type Ref } from 'vue';
import axios from 'axios';
import { defineStore } from 'pinia';
import type { Ingredient } from '@/types/ingredient.type';

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredient = ref<Ingredient | null>(null);
  const ingredients = ref<Ingredient[]>([]);

  const getIngredients = async () => {
    try {
      const response = await axios.get<Ingredient[]>('http://localhost:3000/ingredients');
      ingredients.value = response.data;
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  return {
    ingredient,
    ingredients,
    getIngredients,
  };
});
