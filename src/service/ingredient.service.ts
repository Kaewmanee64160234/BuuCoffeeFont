import type { Ingredient } from "@/types/ingredient.type";
import http from "./axios";

function getAllIngredients() {
  return http.get("/ingredients");
}

function getAllHistoryImportIngredients() {
  return http.get("/importingredients");
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
async function saveIngredient(ingredient: Ingredient & { files: File[] }) {
  const formData = new FormData();
  formData.append('nameIngredient', ingredient.ingredientName || '');
  formData.append('supplier', ingredient.ingredientSupplier || '');
  formData.append('minimun', `${ingredient.ingredientMinimun}`);
  formData.append('unit', ingredient.ingredientUnit || '');
  formData.append('quantityPerUnit', `${ingredient.ingredientQuantityPerUnit || 0}`);
  
  if (ingredient.files && ingredient.files.length > 0) {
    formData.append('IngredientImage', ingredient.files[0]);
  }

  return http.post("/ingredients", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

async function updateIngredient(id: number, ingredient: Ingredient & { files: File[] }) {
  const formData = new FormData();
  formData.append("nameIngredient", ingredient.nameIngredient || '');
  formData.append("supplier", ingredient.supplier || '');
  formData.append("minimun", `${ingredient.minimun || 0}`);
  formData.append("unit", ingredient.unit || '');
  formData.append("quantityInStock", `${ingredient.quantityInStock}`);
  formData.append("quantityPerUnit", `${ingredient.quantityPerUnit || 0}`);
  
  if (ingredient.files && ingredient.files.length > 0) {
    formData.append("file", ingredient.files[0]);
  }

  return await http.patch(`/ingredients/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}



export default {
  getAllIngredients,
  createImportIngredients,
  getAllHistoryImportIngredients,
  saveIngredient,
  updateIngredient
};
