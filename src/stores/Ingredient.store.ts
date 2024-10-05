import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import type { Ingredient } from "@/types/ingredient.type";
import ingredientService from "@/service/ingredient.service";
import type { Importingredient } from "@/types/importIngredient.type";
import { useMessageStore } from "./message";
import type { Importingredientitem } from "@/types/importIngredientItem.type";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import { useLoadingStore } from "./loading.store";

export const useIngredientStore = defineStore("ingredient", () => {
  const loadingStore = useLoadingStore();
  const messageStore = useMessageStore();
  const ingredient = ref<Ingredient | null>(null);
  const ingredients = ref<Ingredient[]>([]);
  const all_ingredients = ref<Ingredient[]>([]);
  const ingredientlow = ref<Ingredient[]>([]);
  const importingredients = ref<Importingredient[]>([]);
  const checkIngerdient = ref<Checkingredient>();
  const search = ref<string>("");
  const selectedAction = ref<string>("");
  const checkDescription = ref<string>("");
  const dialog = ref(false);
  const dialogImportItem = ref(false);
  const editedIngredient = ref<Ingredient & { file: File }>({
    ingredientName: "",
    ingredientSupplier: "",
    ingredientMinimun: 0,
    ingredientUnit: "",
    ingredientQuantityInStock: 0,
    ingredientQuantityPerUnit: 0,
    ingredientQuantityPerSubUnit: "",
    ingredientRemining: 0,
    ingredientImage: "no_image.jpg",
    file: new File([""], "filename"),
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
        ingredientRemining: 0,
        ingredientImage: "no_image.jpg",
        file: new File([""], "filename"),
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
  async function getIngredients() {
    try {
      const response = await ingredientService.getIngredients();
      if (response.status === 200) {
        all_ingredients.value = response.data;
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  }
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
    {
      ingredient: Ingredient;
      count: number;
      totalunit: number;
      unitprice: number;
      name: string;
      importType: 'piece' | 'box';
    }[]
  >([]);
  const ingredientCheckList = ref<
    { ingredientcheck: Ingredient; count: number }[]
  >([]);

  const store = ref<string>("");
  const discount = ref<number>(0);
  const total = ref<number>(0);
  const TypeIngredient = ref<string>("รายการวัตถุดิบ");
  const importStoreType = ref<string>("ร้านกาแฟ");
  const importDescription = ref<string>("");
  const actionType = ref<string>("");
  const shopType = ref<string>("");

  function AddRiceIngredient(item: { ingredientName: string }) {
    const newImportIngredientItem: any = {
      name: item.ingredientName,
      pricePerUnit: 0,
      unitPrice: 0,
      Quantity: 0,
    };
    ingredientList.value.push(newImportIngredientItem);
  }

  function Addingredient(item: Ingredient) {
    const exists = ingredientList.value.some(
      (ingredient) => ingredient.ingredient.ingredientId === item.ingredientId
    );
    if (!exists) {
      ingredientList.value.push({
        ingredient: item,
        count: 1,
        totalunit: 0,
        unitprice: 0,
        name: "",
        importType: 'piece', 
      });
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
    if (exists) {
      const index = ingredientCheckList.value.findIndex(
        (ingredient) =>
          ingredient.ingredientcheck.ingredientId === item.ingredientId
      );
      ingredientCheckList.value[index].count += 1;
    }
  }

  function removeIngredient(index: number) {
    ingredientList.value.splice(index, 1);
  }
  function removeCheckIngredient(index: number) {
    ingredientCheckList.value.splice(index, 1);
  }
  async function getIngredientlow() {
    try {
      const response = await ingredientService.getIngredientlow();
      if (response.status === 200) {
        ingredientlow.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  }

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
    const importingredientitem = ingredientList.value.map((item) => {
      if (importStoreType.value === "ร้านกาแฟ") {
        item.ingredient.ingredientId !== undefined;
        return {
          ingredientId: item.ingredient.ingredientId!,
          pricePerUnit: item.totalunit,
          Quantity: item.count,
          unitPrice: item.unitprice,
          importType: item.importType,
        };
      } else {
        return {
          name: item.name,
        };
      }
    });

    const importingredient = {
      userId: 1,
      importingredientitem: importingredientitem,
      date: new Date(),
      store: store.value,
      discount: discount.value,
      total: total.value,
      importStoreType: importStoreType.value,
      importDescription: importDescription.value,
    };

    console.log("Sending data to API:", importingredient);

    try {
      const res = await ingredientService.createImportIngredients(
        importingredient
      );
      console.log("API response:", res);
    } catch (error) {
      console.error("Error saving import data:", error);
    }
  }

  async function saveCheckData() {
    const ingredientList = ingredientCheckList.value.map((item) => ({
      ingredientId: item.ingredientcheck.ingredientId!,
      UsedQuantity: item.count,
    }));

    const checkIngredientsPayload = {
      checkingredientitems: ingredientList,
      userId: 1,
      date: new Date().toISOString(),
      checkDescription: checkDescription.value,
      actionType: "issuing",
      shopType: "inventory",
    };
    try {
      const response = await ingredientService.createCheckIngredients(
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
  async function createReturnWithdrawalIngredients() {
    const ingredientList = ingredientCheckList.value.map((item) => ({
      ingredientId: item.ingredientcheck.ingredientId!,
      UsedQuantity: item.count,
    }));

    const checkIngredientsPayload = {
      checkingredientitems: ingredientList,
      userId: 1,
      date: new Date().toISOString(),
      checkDescription: checkDescription.value,
      actionType: actionType.value,
      shopType: shopType.value,
    };
    try {
      const response =
        await ingredientService.createReturnWithdrawalIngredients(
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

 
  async function saveIngredient() {
    loadingStore.loading = true;

    try {
      let res;
      if (editedIngredient.value.ingredientId) {
        res = await ingredientService.updateIngredient(
          editedIngredient.value.ingredientId,
          {
            ...editedIngredient.value,
            imageFile: editedIngredient.value.file,
          }
        );
      } else {
        res = await ingredientService.saveIngredient({
          ...editedIngredient.value,
          imageFile: editedIngredient.value.file,
        });
      }
      dialog.value = false; // ปิด dialog หลังจากบันทึกข้อมูลเสร็จสิ้น
      window.location.reload();
      await getAllIngredients(); // Refresh ingredient list after save
    } catch (e) {
      console.log(e);
      messageStore.showError("Cannot save product");
    } finally {
      loadingStore.loading = false; // ให้ isLoading เป็น false ทุกรอบ
    }
  }

  async function setEditedIngredient(ingredient: Ingredient) {
    editedIngredient.value = JSON.parse(JSON.stringify(ingredient));
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
    all_ingredients,
    ingredients,
    search,
    dialog,
    dialogImportItem,
    page,
    keyword,
    take,
    order,
    orderBy,
    lastPage,
    importDescription,
    editedIngredient,
    actionType,
    setEditedIngredient,
    createReturnWithdrawalIngredients,
    removeCheckIngredient,
    ingredientList,
    store,
    shopType,
    discount,
    total,
    importStoreType,
    importingredients,
    ingredientCheckList,
    ingredientlow,
    AddRiceIngredient,
    getAllIngredients,
    checkDescription,
    selectedAction,
    Addingredient,
    saveImportData,
    removeIngredient,
    getAllHistoryImportIngredients,
    Addingredienttotable,
    saveIngredient,
    deleteIngredient,
    searchIngredients,
    getIngredientlow,
    getIngredients,
    saveCheckData,
    checkIngerdient,
    TypeIngredient,
  };
});
