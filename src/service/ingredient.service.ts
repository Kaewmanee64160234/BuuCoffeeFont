import http from "./axios";

function getAllIngredients() {
  return http.get("/ingredients");
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

export default {
  getAllIngredients,
  createImportIngredients,
};
