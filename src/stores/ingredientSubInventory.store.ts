import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import ingredientService from "@/service/ingredient.service";
import type { SubInventoriesCoffee } from "@/types/subinventoriescoffee.type";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import type { IngredientLog } from "@/types/IngredientLog.type";
import type { ReportIngredientLog } from "@/types/pairsWithdrawalReturn.type";
export const useSubIngredientStore = defineStore("subinventory", () => {
  const subingredients_coffee = ref<SubInventoriesCoffee[]>([]);
  const subingredients_rice = ref<SubInventoriesCoffee[]>([]);
  const dialoglog= ref(false);
  const History = ref<Checkingredient[]>([]);
  const HistoryRice = ref<Checkingredient[]>([]);
  const IngredientLog = ref<ReportIngredientLog[]>([]);
  const IngredientLogitem = ref<IngredientLog[]>([]);
  const findByShopType = async () => {
    try {
        const response = await ingredientService.getAllHistoryCoffee();
        if (response.status === 200) {
          History.value = response.data;
        }
    } catch (error) {
        console.error(error);
    }
};
const getLog = async () => {
  try {
      const response = await ingredientService.getLog();
      if (response.status === 200) {
        IngredientLogitem.value = response.data;
      }
  } catch (error) {
      console.error(error);
  }
};
const getIngredientLog = async () => {
  try {
      const response = await ingredientService.getIngredientLog();
      if (response.status === 200) {
        IngredientLog.value = response.data;
      }
  } catch (error) {
      console.error(error);
  }
};
const findByShopTypeRice = async () => {
  try {
      const response = await ingredientService.getAllHistoryRice();
      if (response.status === 200) {
        HistoryRice.value = response.data;
      }
  } catch (error) {
      console.error(error);
  }
};
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
    History,
    dialoglog,
    HistoryRice,
    IngredientLog,
    IngredientLogitem,
    getSubIngredients_coffee,
    getSubIngredients_rice,
    findByShopType,
    findByShopTypeRice,
    getIngredientLog,
    getLog
  };
});
