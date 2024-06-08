import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import type { Ingredient } from "@/types/ingredient.type";
import ingredientService from "@/service/ingredient.service";
import type { Importingredient } from "@/types/importIngredient.type";
import { useLoadingStore } from "./loading";
import { useMessageStore } from "./message";

export const useIngredientStore = defineStore("ingredient", () => {
  const loadingStore = useLoadingStore();
  const messageStore = useMessageStore();
  const loaded = ref(false);
  const loading = ref(false);
  const ingredient = ref<Ingredient | null>(null);
  const ingredients = ref<Ingredient[]>([]);
  const importingredients = ref<Importingredient[]>([]);
  const search = ref<string>("");
  const dialog = ref(false); // สถานะของ Dialog
  const editedIngredient = ref<Ingredient & { files: File[] }>({
    ingredientName: "",
    ingredientSupplier: "",
    ingredientMinimun: 0,
    ingredientUnit: "",
    ingredientQuantityInStock: 0,
    ingredientQuantityPerUnit: 0,
    ingredientQuantityPerSubUnit: "",
    ingredientRemining:0,
    ingredientImage: "no_image.jpg",
    files: [],
  });
  watch(dialog, (newDialog, oldDialog) => {
    if (!newDialog) {
      editedIngredient.value = {
        ingredientName: "",
        ingredientSupplier: "",
    ingredientMinimun: 0,
    ingredientUnit: "",
    ingredientQuantityInStock: 0,
    ingredientQuantityPerUnit: 0,
    ingredientQuantityPerSubUnit: "",
    ingredientRemining:0,
    ingredientImage: "no_image.jpg",
    files: [],
      };
    }
  });
  // about pagination
  const page = ref(1);
  const take = ref(5);
  const keyword = ref("");
  const order = ref("ASC");
  const orderBy = ref("");
  const lastPage = ref(0);
  watch(page, async (newPage, oldPage) => {
    await getAllIngredients();
  });
  watch(keyword, async (newKey, oldKey) => {
    if (keyword.value.length >= 3) {
      await getAllIngredients();
    }
    if (keyword.value.length === 0) {
      await getAllIngredients();
    }
  });
  watch(lastPage, async (newlastPage, oldlastPage) => {
    if (newlastPage < page.value) {
      page.value = 1;
    }
  });

  async function getAllIngredients() {
    try {
      const res = await ingredientService.getAllIngredients({
        page: page.value,
        take: take.value,
        keyword: keyword.value,
        order: order.value,
        orderBy: orderBy.value,
      });
      ingredients.value = res.data.data;

      lastPage.value = res.data.lastPage;
    } catch (e) {
      console.log(e);
      messageStore.showError("Oops!, cannot get ingredients.");
    }
  }
  async function searchIngredients(name: string) {
    try {
      const res = await ingredientService.searchIngredientsByName(name);
      ingredients.value = res.data;
    } catch (e) {
      console.log(e);
      messageStore.showError("Oops!, cannot search ingredients.");
    }
  }


  const ingredientList = ref<
    { ingredient: Ingredient; count: number; totalunit: number }[]
  >([]);
  const ingredientCheckList = ref<
    { ingredientcheck: Ingredient; count: number }[]
  >([]);
  const store = ref<string>("");
  const discount = ref<number>(0);
  const total = ref<number>(0);

  function Addingredient(item: Ingredient) {
    const exists = ingredientList.value.some(
      (ingredient) => ingredient.ingredient.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientList.value.push({ ingredient: item, count: 1, totalunit: 0 });
    }
  }
  function Addingredienttotable(item: Ingredient) {
    const exists = ingredientCheckList.value.some(
      (ingredient) =>
        ingredient.ingredientcheck.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientCheckList.value.push({ ingredientcheck: item, count: 1 });
    }
  }

  function removeIngredient(index: number) {
    ingredientList.value.splice(index, 1);
  }

  // const getAllIngredients = async () => {
  //   try {
  //     const response = await ingredientService.getAllIngredients();
  //     if (response.status === 200) {
  //       ingredients.value = response.data;
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const getAllHistoryImportIngredients = async () => {
    try {
      const response = await ingredientService.getAllHistoryImportIngredients();
      if (response.status === 200) {
        console.log("getAllHistoryImportIngredients", response.data);
        importingredients.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function saveImportData() {
    const importingredientitem = ingredientList.value
      .filter((item) => item.ingredient.ingredientId !== undefined)
      .map((item) => ({
        ingredientId: item.ingredient.ingredientId!,
        pricePerUnit: item.totalunit,
        Quantity: item.count,
      }));

    const importingredient = {
      userId: 1,
      importingredientitem: importingredientitem,
      date: new Date(),
      store: store.value,
      discount: discount.value,
      total: total.value,
    };

    console.log("Sending data to API:", importingredient);

    try {
      const res = await ingredientService.createImportIngredients(
        importingredient
      );
      console.log("API response:", res);
    } catch (error) {
      console.error("Error saving import data:");
    }
  }
  async function saveIngredient() {
    loadingStore.isLoading = true;
    try {
      if (editedIngredient.value.ingredientId) {
        const res = await ingredientService.updateIngredient(
          editedIngredient.value.ingredientId,
          editedIngredient.value
          
        );
      } else {
        const res = await ingredientService.saveIngredient(editedIngredient.value);
      }
      dialog.value = false;
    } catch (e) {
      console.log(e);
      messageStore.showError("Cannot save product");
    }
    loadingStore.isLoading = false;
  }
  async function setEditedIngredient(ingredient: Ingredient) {
    editedIngredient.value = JSON.parse(JSON.stringify(ingredient));
    await getAllIngredients(); 
    dialog.value = true;
  }
  
  const deleteIngredient = async (id: number) => {
    try {
      await ingredientService.deleteIngredient(id);
      await getAllIngredients();
    } catch (e) {
      console.log(e);
      messageStore.showError("Cannot delete Ingredient");
    }
  };
  return {
    ingredient,
    ingredients,
    search,
    dialog,
    page,
    keyword,
    take,
    order,
    orderBy,
    lastPage,
    editedIngredient,
    setEditedIngredient,
    ingredientList,
    store,
    discount,
    total,
    importingredients,
    ingredientCheckList,
    getAllIngredients,
    Addingredient,
    saveImportData,
    removeIngredient,
    getAllHistoryImportIngredients,
    Addingredienttotable,
    saveIngredient,
    deleteIngredient,
    searchIngredients
    
  };
});
