import type { Ingredient } from "@/types/ingredient.type";
import http from "./axios";
function getIngredientlow() {
  return http.get("/ingredients/low-stock");
}
function getIngredients() {
  return http.get("/ingredients", );
}
function getAllIngredients(params: any) {
  return http.get("/ingredients/all", { params: params });
}

function getAllHistoryImportIngredients() {
  return http.get("/importingredients");
}
function getAllHistoryCheckIngredients() {
  return http.get("/checkingredients");
}
function createImportIngredients(ingredient: {
  importingredientitem: {
    ingredientId: number;
    pricePerUnit: number;
    Quantity: number;
  }[];
  userId: number;
  date: Date;
  store: string;
  discount: number;
  total: number;
}) {
  return http.post("/importingredients", ingredient);
}
function createCheckIngredients(ingredient: {
  checkingredientitems: {
    ingredientId: number;
    UsedQuantity: number;
  }[];
  userId: number;
  date: string;
  checkDescription: string;
  actionType: string;
}) {
  return http.post("/checkingredients", ingredient);
}


async function saveIngredient(ingredient: Ingredient & { imageFile: File }) {
  console.log("Image file', " + JSON.stringify(ingredient));
  
  const formData = new FormData();
  formData.append('ingredientName', ingredient.ingredientName || '');
  formData.append('ingredientSupplier', ingredient.ingredientSupplier || '');
  formData.append('ingredientMinimun', `${ingredient.ingredientMinimun}`);
  formData.append('ingredientUnit', ingredient.ingredientUnit || '');
  formData.append('ingredientQuantityPerUnit', `${ingredient.ingredientQuantityPerUnit || 0}`);
  formData.append('ingredientQuantityPerSubUnit', ingredient.ingredientQuantityPerSubUnit || '');

  if (ingredient.imageFile) {
    formData.append('imageFile', ingredient.imageFile, ingredient.imageFile.name);
  }

  return http.post("/ingredients", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

async function updateIngredient(id: number, ingredient: Ingredient & { imageFile: File }) {
  const formData = new FormData();
  formData.append("ingredientName", ingredient.ingredientName || '');
  formData.append("ingredientSupplier", ingredient.ingredientSupplier || '');
  formData.append("ingredientMinimun", `${ingredient.ingredientMinimun || 0}`);
  formData.append("ingredientUnit", ingredient.ingredientUnit || '');
  formData.append("ingredientQuantityPerUnit", `${ingredient.ingredientQuantityPerUnit || 0}`);
  formData.append('ingredientQuantityPerSubUnit', ingredient.ingredientQuantityPerSubUnit || '');

  if (ingredient.imageFile ) {
    formData.append('imageFile', ingredient.imageFile, ingredient.imageFile.name);

  }

  return await http.patch(`/ingredients/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
function deleteIngredient(id: number) {
  return http.delete(`/ingredients/${id}`);
}


function searchIngredientsByName(name: string) {
  return http.get("/ingredients/search", { params: { name } });
}


export default {
  getAllIngredients,
  createImportIngredients,
  createCheckIngredients,
  getAllHistoryImportIngredients,
  saveIngredient,
  updateIngredient,
  getIngredients,
  deleteIngredient,
  searchIngredientsByName,
  getIngredientlow,
  getAllHistoryCheckIngredients
};
