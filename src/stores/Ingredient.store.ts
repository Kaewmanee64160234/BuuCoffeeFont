import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Ingredient } from '@/types/ingredient.type';
import ingredientService from '@/service/ingredient.service';
import type { Importingredient } from '@/types/importIngredient.type';

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredient = ref<Ingredient | null>(null);
  const ingredients = ref<Ingredient[]>([]);
  const importingredients = ref<Importingredient[]>([]);
  const search = ref<string>("");
  const dialog = ref(false); // สถานะของ Dialog
  const editedIngredient = ref<Ingredient>({
    IngredientId: 0,
    nameIngredient: "",
    supplier: "",
    minimun: 0,
    unit: "",
    quantityInStock: 0,
    quantityPerUnit: 0,
    IngredientImage: ""
  });
  const ingredientList = ref<{ ingredient: Ingredient; count: number; totalunit: number }[]>([]);
  const ingredientCheckList = ref<{ ingredientcheck: Ingredient; count: number}[]>([]);
  const store = ref<string>("");
  const discount = ref<number>(0);
  const total = ref<number>(0);

  function Addingredient(item: Ingredient) {
    const exists = ingredientList.value.some(ingredient => ingredient.ingredient.IngredientId === item.IngredientId);
    if (!exists) {
      ingredientList.value.push({ ingredient: item, count: 1, totalunit: 0 });
    }
  }
  function Addingredienttotable(item: Ingredient) {
    const exists = ingredientCheckList.value.some(ingredient => ingredient.ingredientcheck.IngredientId === item.IngredientId);
    if (!exists) {
      ingredientCheckList.value.push({ ingredientcheck: item, count: 1 });
    }
  }

  function removeIngredient(index: number) {
    ingredientList.value.splice(index, 1);
  }

  const getAllIngredients = async () => {

    try {
      const response = await ingredientService.getAllIngredients();
      if (response.status === 200) {
        ingredients.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getAllHistoryImportIngredients = async () => {

    try {
      const response = await ingredientService.getAllHistoryImportIngredients();
      if (response.status === 200) {
        console.log('getAllHistoryImportIngredients', response.data);
        importingredients.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };


  async function saveImportData() {
    const importingredientitem = ingredientList.value
      .filter(item => item.ingredient.IngredientId !== undefined)
      .map(item => ({
        ingredientId: item.ingredient.IngredientId!,
        pricePerUnit: item.totalunit,
        Quantity: item.count
      }));
  
    const importingredient = {
      userId: 1,
      importingredientitem: importingredientitem,
      date: new Date(),
      store: store.value,
      discount: discount.value,
      total: total.value
    };
  
    console.log('Sending data to API:', importingredient);
  
    try {
      const res = await ingredientService.createImportIngredients(importingredient);
      console.log('API response:', res);
    } catch (error) {
      console.error('Error saving import data:');
    }
  }

  return {
    ingredient,
    ingredients,
    search,
    dialog,
    editedIngredient,
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
    Addingredienttotable
  };
});
