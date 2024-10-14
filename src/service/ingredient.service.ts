import type { Ingredient } from "@/types/ingredient.type";
import http from "./axios";
import type { SubInventoriesCatering } from "@/types/subinventoriescateringtype";
function getIngredientlow() {
  return http.get("/ingredients/low-stock");
}
function getIngredients() {
  return http.get("/ingredients");
}
function getAllIngredients(params: any) {
  return http.get("/ingredients/all", { params: params });
}

function getAllHistoryImportIngredients() {
  return http.get("/importingredients");
}
function getAllHistoryCheckIngredients() {
  return http.get("/checkingredients?actionType=issuing");
}
function getAllHistoryCoffee() {
  return http.get("/checkingredients/findByShopType?shopType=coffee");
}
function getAllHistoryRice() {
  return http.get("/checkingredients/findByShopType?shopType=rice");
}
function getAllHistoryCatering() {
  return http.get("/checkingredients/findByShopType?shopType=catering");
}
function getAllHistoryCateringHistory() {
  return http.get("/checkingredients/findByShopType?shopType=catering&actionType=withdrawalHistory");
}
function createImportIngredients(ingredient: {
  importingredientitem: {
    ingredientId: number;
    pricePerUnit: number;
    Quantity: number;
    unitPrice: number;
    name: string;
  }[];
  userId: number;
  date: Date;
  store: string;
  discount: number;
  total: number;
  importDescription: string;
  importStoreType: string;
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
  shopType: string;
}) {
  return http.post("/checkingredients/without-inventory", ingredient);
}
function createReturnWithdrawalIngredients(ingredient: {
  checkingredientitems: {
    ingredientId: number;
    UsedQuantity: number;
  }[];
  userId: number;
  date: string;
  checkDescription: string;
  actionType: string;
  shopType: string;
}) {
  return http.post("/checkingredients", ingredient);
}
async function saveIngredient(ingredient: Ingredient & { imageFile: File }) {
  console.log("Image file', " + JSON.stringify(ingredient));

  const formData = new FormData();
  formData.append("ingredientName", ingredient.ingredientName || "");
  formData.append("ingredientSupplier", ingredient.ingredientSupplier || "");
  formData.append("ingredientMinimun", `${ingredient.ingredientMinimun}`);
  formData.append("ingredientUnit", ingredient.ingredientUnit || "");
  formData.append(
    "ingredientQuantityPerUnit",
    `${ingredient.ingredientQuantityPerUnit || 0}`
  );
  formData.append(
    "ingredientQuantityPerSubUnit",
    ingredient.ingredientQuantityPerSubUnit || ""
  );

  if (ingredient.imageFile) {
    formData.append(
      "imageFile",
      ingredient.imageFile,
      ingredient.imageFile.name
    );
  }

  return http.post("/ingredients", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

async function updateIngredient(
  id: number,
  ingredient: Ingredient & { imageFile: File }
) {
  const formData = new FormData();
  formData.append("ingredientName", ingredient.ingredientName || "");
  formData.append("ingredientSupplier", ingredient.ingredientSupplier || "");
  formData.append("ingredientMinimun", `${ingredient.ingredientMinimun || 0}`);
  formData.append("ingredientUnit", ingredient.ingredientUnit || "");
  formData.append(
    "ingredientQuantityPerUnit",
    `${ingredient.ingredientQuantityPerUnit || 0}`
  );
  formData.append(
    "ingredientQuantityPerSubUnit",
    ingredient.ingredientQuantityPerSubUnit || ""
  );

  if (ingredient.imageFile) {
    formData.append(
      "imageFile",
      ingredient.imageFile,
      ingredient.imageFile.name
    );
  }

  return await http.patch(`/ingredients/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
function deleteIngredient(id: number) {
  return http.delete(`/ingredients/${id}`);
}
function getIngredientLog() {
  return http.get(`/ingredientusagelog/withdrawal-return-pairs`);
}
function searchIngredientsByName(name: string) {
  return http.get("/ingredients/search", { params: { name } });
}
function getHistoryCheckById(id: number) {
  return http.get(`/checkingredients/${id}`);
}
function getHistoryImportById(id: number) {
  return http.get(`/importingredients/${id}`);
}
function getSubIngredients_Coffee() {
  return http.get(`/sub-inventories-coffee`);
}
function getSubIngredients_Rice() {
  return http.get(`/sub-inventories-rice`);
}
function getSubIngredients_Catering() {
  return http.get(`/sub-inventories-catering`);
}
function getLog() {
  return http.get(`/ingredientusagelog`);
}

const createSubInventoriesCatering = (data: SubInventoriesCatering) => {
  return http.post("/sub-inventories-catering", [
    {
      ingredient: data.ingredient,
      quantity: data.quantity,
      type: data.type,
    },
  ]);
};


const createReturnWithdrawalIngredientsForCatering = (ingredient: {
  checkingredientitems: {
    ingredientId: number;
    UsedQuantity: number;
    type: string;
    subTotal: number;
    unitPrice: number;
  }[];
  userId: number;
  date: string;
  checkDescription: string;
  actionType: string;
  shopType: string;
  totalPrice?: number;
}) => {
  return http.post("/checkingredients/catering", ingredient);
};

function getIngredientsCateringPaginate(page: number, size: number,search : string) {
  return http.get(`/sub-inventories-catering/paginate`, {
    params: {
      page,
      limit: size,
      search
    }
  });

}

function getIngredientsRicePaginate(page: number, size: number,search : string) {
  return http.get(`/sub-inventories-rice/paginate`, {
    params: {
      page,
      limit: size,
      search
    }
  });

}

function getIngredientsCoffeePaginate(page: number, size: number,search : string) {
  return http.get(`/sub-inventories-coffee/paginate`, {
    params: {
      page,
      limit: size,
      search
    }
  });

}

export default {
  getAllIngredients,
  createImportIngredients,
  createCheckIngredients,
  createReturnWithdrawalIngredients,
  getHistoryCheckById,
  getHistoryImportById,
  getAllHistoryImportIngredients,
  getLog,
  saveIngredient,
  updateIngredient,
  getIngredients,
  deleteIngredient,
  searchIngredientsByName,
  getIngredientlow,
  getAllHistoryCoffee,
  getSubIngredients_Coffee,
  getAllHistoryRice,
  getSubIngredients_Rice,
  getIngredientLog,
  getAllHistoryCheckIngredients,
  createSubInventoriesCatering,
  createReturnWithdrawalIngredientsForCatering,
  getSubIngredients_Catering,
  getAllHistoryCatering,
  getAllHistoryCateringHistory,
  getIngredientsCoffeePaginate,
  getIngredientsCateringPaginate,
  getIngredientsRicePaginate
};
