import { ref, watch } from "vue";
import { defineStore } from "pinia";
import ingredientService from "@/service/ingredient.service";
import type { SubInventoriesCoffee } from "@/types/subinventoriescoffee.type";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import type { IngredientLog } from "@/types/IngredientLog.type";
import type { ReportIngredientLog } from "@/types/pairsWithdrawalReturn.type";
import type { Ingredient } from "@/types/ingredient.type";
import { useUserStore } from "./user.store";
import type { SubInventoriesRice } from "@/types/subinventoriesrice.type";
import type { SubInventoriesCatering } from "@/types/subinventoriescateringtype";

export const useSubIngredientStore = defineStore("subinventory", () => {
  const subingredients_coffee = ref<SubInventoriesCoffee[]>([]);
  const selectedIngredient= ref<Ingredient>();
  const subIngredients_catering = ref<SubInventoriesCoffee[]>([]);
  const subingredients_rice = ref<SubInventoriesRice[]>([]);
  const subingredientsRiceCatering = ref<SubInventoriesCatering[]>([]);
  const subingredientsCoffeeCatering = ref<SubInventoriesCoffee[]>([]);
  const dialoglog = ref(false);
  const History = ref<Checkingredient[]>([]);
  const HistoryRice = ref<Checkingredient[]>([]);
  const HistoryCatering = ref<Checkingredient[]>([]);
  const IngredientLog = ref<ReportIngredientLog[]>([]);
  const IngredientLogitem = ref<IngredientLog[]>([]);
  const checkIngerdient = ref<Checkingredient>();
  const userStore = useUserStore();

  const ingredientCheckListForCofee = ref<
    { ingredientcheck: Ingredient; count: number; type: string }[]
  >([]);
  const ingredientCheckListForRice = ref<
    { ingredientcheck: Ingredient; count: number; type: string }[]
  >([]);
  const ingredientCheckListForCatering = ref<
    { ingredientcheck: Ingredient; count: number; type: string }[]
  >([]);
  const ingredientCheckList = ref<
    { ingredientcheck: Ingredient; count: number; type: string,lastPrice?:number }[]
  >([]);



  // about pagination
  const searchQuery = ref<string>("");
  const totalIngredients = ref(0);
  const currentPage = ref(1);
  const itemsPerPage = ref(5);
  


  // watch for pagination
  watch([currentPage, itemsPerPage, searchQuery], () => {
    getIngredientsCoffeePaginate();
  });
  watch([currentPage, itemsPerPage, searchQuery], () => {
    getIngredientsRicePaginate();
  });
  watch([currentPage, itemsPerPage, searchQuery], () => {
    getIngredientsCateringPaginate();
  });

  // getToppingsPaginate
  const getIngredientsCoffeePaginate = async () => {
    try {
        const response = await ingredientService.getIngredientsCoffeePaginate(currentPage.value, itemsPerPage.value, searchQuery.value);
        console.log('getIngredientsCoffeePaginatexxxx', response.data);
        currentPage.value,   // Current page
        itemsPerPage.value,  // Items per page
        searchQuery.value    // Search term
        if (response.status === 200) {
            ingredientCheckListForCofee.value = response.data.data;
            totalIngredients.value = response.data.total; 
            console.log('Total Ingredients:', totalIngredients.value); 
        }
    } catch (error) {
        console.error('Error getting ingredientsCoffeePaginate:', error);
    }
  };

  const getIngredientsRicePaginate = async () => {
    try {
        const response = await ingredientService.getIngredientsRicePaginate(currentPage.value, itemsPerPage.value, searchQuery.value);
        console.log('getIngredientsRicePaginate', response.data);
        if (response.status === 200) {
            ingredientCheckListForRice.value = response.data.data;
            totalIngredients.value = response.data.total;
        }
    } catch (error) {
        console.error('Error getting ingredientsRicePaginate:', error);
    }
  };
  
  
  const getIngredientsCateringPaginate = async () => {
    try {
        const response = await ingredientService.getIngredientsCateringPaginate(currentPage.value, itemsPerPage.value, searchQuery.value);
        console.log('getIngredientsCateringPaginate', response.data);
        if (response.status === 200) {
            ingredientCheckListForCatering.value = response.data.data;
            totalIngredients.value = response.data.total; 
            console.log('Total Ingredients:', totalIngredients.value); 
        }
    } catch (error) {
        console.error('Error getting ingredientsCateringPaginate:', error);
    }
  };
  

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
  const findByShopTypeCatering = async () => {
    try {
      const response = await ingredientService.getAllHistoryCatering();
      if (response.status === 200) {
        HistoryCatering.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const findByShopTypeCateringHistory = async () => {
    try {
      const response = await ingredientService.getAllHistoryCateringHistory();
      if (response.status === 200) {
        HistoryCatering.value = response.data;
        console.log(response.data);
        
      }
    } catch (error) {
      console.error(error);
    }
  };
  async function getSubIngredients_coffee() {
    try {
      const res = await ingredientService.getSubIngredients_Coffee();
      const filteredSubIngredients = res.data.filter(item => item.quantity > 0);
      subingredients_coffee.value = filteredSubIngredients;
      // console.log(subingredients_coffee.value)
    } catch (e) {
      console.log(e);
    }
  }
  async function getSubIngredients_rice() {
    try {
      const res = await ingredientService.getSubIngredients_Rice();
      const filteredSubIngredients = res.data.filter(item => item.quantity > 0);
      subingredients_rice.value = filteredSubIngredients;
      // console.log(subingredients_coffee.value)
    } catch (e) {
      console.log(e);
    }
  }

  // get ingerdia _catering
  async function getSubIngredients_catering() {
    try {
      const res = await ingredientService.getSubIngredients_Catering();
      subIngredients_catering.value = res.data;
      console.log(res.data);
    } catch (e) {
      console.log(e);
    }
  }
  const addSubIngredients = (item: Ingredient, type: string,lastPrice?:number) => {
    const exists = ingredientCheckList.value.some(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId
    );
  

    if (!exists) {
      ingredientCheckList.value.push({
        ingredientcheck: item,
        count: 1,
        type: type,
        lastPrice: lastPrice,
      });
    }
    if (exists) {
     
      const index = ingredientCheckList.value.findIndex(
        (ingredient) =>
          ingredient.ingredientcheck.ingredientId === item.ingredientId
      );
      ingredientCheckList.value[index].count += 1;
    }
  };

  // removeCheckIngredient
  const removeCheckIngredient = (item: Ingredient,type:string) => {
    const index = ingredientCheckList.value.findIndex(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId &&  type === ingredient.type
    );
    if (index !== -1) {
      ingredientCheckList.value.splice(index, 1);
    }
  };

  const addSubIngredientsCoffeeCatering = async (item: Ingredient) => {
    const exists = ingredientCheckListForCofee.value.some(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientCheckListForCofee.value.push({
        ingredientcheck: item,
        count: 1,
        type: "coffee",
      });
      ingredientCheckList.value.push({
        ingredientcheck: item,
        count: 1,
        type: "coffee",
      });
    }
    if (exists) {
      const index = ingredientCheckListForCofee.value.findIndex(
        (ingredient) =>
          ingredient.ingredientcheck.ingredientId === item.ingredientId
      );
      ingredientCheckListForCofee.value[index].count += 1;
      ingredientCheckList.value[index].count += 1;
    }
  };

  // addSubIngredientsRiceCatering
  const addSubIngredientsRiceCatering = (item: Ingredient,lastPrice:number) => {
    const exists = ingredientCheckListForRice.value.some(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientCheckListForRice.value.push({
        ingredientcheck: item,
        count: 1,
        type: "rice",
      });
      ingredientCheckList.value.push({
        ingredientcheck: item,
        count: 1,
        type: "rice",
        lastPrice: lastPrice
      });
    }
    if (exists) {
      const index = ingredientCheckListForRice.value.findIndex(
        (ingredient) =>
          ingredient.ingredientcheck.ingredientId === item.ingredientId
      );
      ingredientCheckListForRice.value[index].count += 1;
      ingredientCheckList.value[index].count += 1;
    }
  };

  async function createReturnWithdrawalIngredientsForCatering() {
    const ingredientList1 = ingredientCheckList.value.map((item) => ({
      ingredientId: item.ingredientcheck.ingredientId!,
      UsedQuantity: item.count,
      type: item.type,
    }));

    console.log("ingredientList1", ingredientList1);

    const checkIngredientsPayload = {
      checkingredientitems: ingredientList1,
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
  // createReturnWithdrawalIngredientsForCateringHistory
  function createReturnWithdrawalIngredientsForCateringHistory(totalPrice:number) {
    const ingredientList1 = ingredientCheckList.value.map((item) => ({
      ingredientId: item.ingredientcheck.ingredientId!,
      UsedQuantity: item.count,
      type: item.type,
      unitPrice: item.lastPrice,
      subTotal: item.lastPrice! * item.count
    }));

    const checkIngredientsPayload = {
      checkingredientitems: ingredientList1,
      userId: userStore.currentUser?.userId || 1,
      date: new Date().toISOString(),
      checkDescription: "เลี้ยงรับรอง",
      actionType: "withdrawalHistory",
      shopType: "catering",
      totalPrice:totalPrice
    };
    console.log("checkIngredientsPayload", checkIngredientsPayload);
    try {
      const response =
        ingredientService.createReturnWithdrawalIngredientsForCatering(
          checkIngredientsPayload
        );
      console.log("API response:", response);
    } catch (error) {
      console.error("Error saving check data:", error);
    }
  }

  // createReturnIngerdian
  async function createReturnIngredientsForCatering() {
    const ingredientList1 = ingredientCheckList.value.map((item) => ({
      ingredientId: item.ingredientcheck.ingredientId!,
      UsedQuantity: item.count,
      type: item.type,
    }));

    const checkIngredientsPayload = {
      checkingredientitems: ingredientList1,
      userId: userStore.currentUser?.userId || 1,
      date: new Date().toISOString(),
      checkDescription: "เลี้ยงรับรอง",
      actionType: "return",
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
    selectedIngredient,
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
    checkIngerdient,
    getSubIngredients_catering,
    subIngredients_catering,
    createReturnIngredientsForCatering,
    ingredientCheckList,
    addSubIngredients,
    removeCheckIngredient,
    findByShopTypeCatering,
    HistoryCatering,
    createReturnWithdrawalIngredientsForCateringHistory,
    findByShopTypeCateringHistory,
    getIngredientsCoffeePaginate,
    getIngredientsRicePaginate,
    getIngredientsCateringPaginate,
    totalIngredients,
    currentPage,
    itemsPerPage,
    ingredientCheckListForCatering
  };
});
