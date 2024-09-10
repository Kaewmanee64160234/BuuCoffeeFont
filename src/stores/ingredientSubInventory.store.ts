import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import ingredientService from "@/service/ingredient.service";
import type { SubInventoriesCoffee } from "@/types/subinventoriescoffee.type";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import type { IngredientLog } from "@/types/IngredientLog.type";
import type { ReportIngredientLog } from "@/types/pairsWithdrawalReturn.type";
import type { Ingredient } from "@/types/ingredient.type";
import { useUserStore } from "./user.store";
export const useSubIngredientStore = defineStore("subinventory", () => {
  const subingredients_coffee = ref<SubInventoriesCoffee[]>([]);
  const subingredients_rice = ref<SubInventoriesCoffee[]>([]);
  const subingredientsRiceCatering = ref<SubInventoriesCoffee[]>([]);
  const subingredientsCoffeeCatering = ref<SubInventoriesCoffee[]>([]);
  const dialoglog = ref(false);
  const History = ref<Checkingredient[]>([]);
  const HistoryRice = ref<Checkingredient[]>([]);
  const IngredientLog = ref<ReportIngredientLog[]>([]);
  const IngredientLogitem = ref<IngredientLog[]>([]);
  const checkIngerdient = ref<Checkingredient>();
  const userStore = useUserStore();
  const ingredientCheckListForCofee = ref<
    { ingredientcheck: Ingredient; count: number,type:string }[]
  >([]);
  const ingredientCheckListForRice = ref<
    { ingredientcheck: Ingredient; count: number,type:string }[]
  >([]);

  const ingredientcheckForRice = ref<Ingredient[]>([]);

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
  const addSubIngredientsCoffeeCatering = async (item: Ingredient) => {
    const exists = ingredientCheckListForCofee.value.some(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientCheckListForCofee.value.push({
        ingredientcheck: item,
        count: 1,
        type:'coffee'
      });
    }
    if (exists) {
      const index = ingredientCheckListForCofee.value.findIndex(
        (ingredient) =>
          ingredient.ingredientcheck.ingredientId === item.ingredientId
      );
      ingredientCheckListForCofee.value[index].count += 1;
    }
  };
  // addSubIngredientsRiceCatering
  const addSubIngredientsRiceCatering = (item: Ingredient) => {
    const exists = ingredientCheckListForRice.value.some(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientCheckListForRice.value.push({
        ingredientcheck: item,
        count: 1,
        type:'rice'
      });
    }
    if (exists) {
      const index = ingredientCheckListForRice.value.findIndex(
        (ingredient) =>
          ingredient.ingredientcheck.ingredientId === item.ingredientId
      );
      ingredientCheckListForRice.value[index].count += 1;
    }
  };

  async function createReturnWithdrawalIngredientsForCatering() {

      const ingredientList1 = ingredientCheckListForCofee.value.map((item) => ({
        ingredientId: item.ingredientcheck.ingredientId!,
        UsedQuantity: item.count,
        type:item.type
      }));
      const ingredientList2 = ingredientCheckListForRice.value.map((item) => ({
        ingredientId: item.ingredientcheck.ingredientId!,
        UsedQuantity: item.count,
        type:item.type
      }));
      const ingredientList = [...ingredientList1, ...ingredientList2];

      const checkIngredientsPayload = {
        checkingredientitems: ingredientList,
        userId: userStore.currentUser?.userId || 1,
        date: new Date().toISOString(),
        checkDescription: "เลี้ยงรับรอง",
        actionType: "withdrawal",
        shopType: "catering",
      };
      console.log("checkIngredientsPayload", checkIngredientsPayload);
      
      try {
        const response =
          await ingredientService.createReturnWithdrawalIngredientsForCatering(
            checkIngredientsPayload
          );
        if (response.status === 201) {
          checkIngerdient.value = response.data;
          console.log("checkIngerdient", checkIngerdient.value);
        }
        console.log("API response:", response);
      } catch (error) {
        console.error("Error saving check data:", error);
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
    getLog,
    subingredientsRiceCatering,
    subingredientsCoffeeCatering,
    addSubIngredientsCoffeeCatering,
    addSubIngredientsRiceCatering,
    ingredientCheckListForCofee,
    ingredientCheckListForRice,
    createReturnWithdrawalIngredientsForCatering,
    checkIngerdient
  };
});
