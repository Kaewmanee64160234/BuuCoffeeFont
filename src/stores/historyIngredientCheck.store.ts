import { ref } from "vue";
import ingredientService from "@/service/ingredient.service";
import { defineStore } from "pinia";
import type { Checkingredient } from "@/types/checkingredientitem.type";

export const useCheckIngredientStore = defineStore(
  "checkIngredient",
  () => {
    const CheckIngredientsHistory = ref<Checkingredient[]>([]);
    const dialogCheckItem = ref(false);
    const checkingredient = ref<Checkingredient | null>(null);
    const actionType = ref<string>('');

    const getAllHistortIngredients = async () => {
      try {
          const response = await ingredientService.getAllHistoryCheckIngredients();
          if (response.status === 200) {
            CheckIngredientsHistory.value = response.data;
          }
      } catch (error) {
          console.error(error);
      }
  };
  const getHistoryCheckById = async (id: number) => {
    try {
      const response = await ingredientService.getHistoryCheckById(id);
      if (response.status === 200) {
        checkingredient.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  return {
    CheckIngredientsHistory,
    getAllHistortIngredients,
    getHistoryCheckById,
    checkingredient,
    dialogCheckItem,
    actionType,
  };
});