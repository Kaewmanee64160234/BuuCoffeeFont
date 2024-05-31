import type { Ingredient } from "@/types/ingredient.type";
import http from "./axios";

function getAllIngredients() {
    return http.get("/ingredients");
  }
  export default {
    getAllIngredients
  };