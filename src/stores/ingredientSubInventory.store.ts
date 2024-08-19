import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import ingredientService from "@/service/ingredient.service";
import type { SubInventoriesCoffee } from "@/types/subinventoriescoffee.type";
export const useSubIngredientStore = defineStore("subinventory", () => {
  const subingredients_coffee = ref<SubInventoriesCoffee[]>([]);
  const subingredients_rice = ref<SubInventoriesCoffee[]>([]);


  async function getSubIngredients_coffee() {
    try {
      const res = await ingredientService.getSubIngredients_Coffee();
      subingredients_coffee.value = res.data;
      // console.log(subingredients_coffee.value)
    } catch (e) {
      console.log(e);
    }
  }
  async function getSubIngredients_rice() {
    try {
      const res = await ingredientService.getSubIngredients_Rice();
      subingredients_rice.value = res.data;
      // console.log(subingredients_coffee.value)
    } catch (e) {
      console.log(e);
    }
  }
  return {
    subingredients_coffee,
    subingredients_rice,
    getSubIngredients_coffee,
    getSubIngredients_rice,
  };
});
