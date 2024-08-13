import { ref } from "vue";
import ingredientService from "@/service/ingredient.service";
import type { Importingredient } from "@/types/importIngredient.type";
import { defineStore } from "pinia";
export const useHistoryIngredientImportStore = defineStore(
  "historyIngredientImport",
  () => {
    const importIngredientsHistory = ref<Importingredient[]>([]);
    const dialoImportItem = ref(false);
    const importingredient = ref<Importingredient | null>(null);
    const selectedItems = ref([]);

    const getAllHistoryImportIngredients = async () => {
      try {
          const response = await ingredientService.getAllHistoryImportIngredients();
          if (response.status === 200) {
              importIngredientsHistory.value = response.data;
          }
      } catch (error) {
          console.error(error);
      }
  };
  const getHistoryImportById = async (id: number) => {
    try {
      const response = await ingredientService.getHistoryImportById(id);
      if (response.status === 200) {
        importingredient.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
      importIngredientsHistory,
      dialoImportItem,
      importingredient,
      getAllHistoryImportIngredients,
      getHistoryImportById,
      selectedItems,
  };
});