import type { Category } from "@/types/category.type";
import http from "./axios";

function getAllCategories() {
  return http.get("/categories");
}

function getCategoryById(id: number) {
  return http.get(`/categories/${id}`);
}

function createCategory(category: Category) {
  console.log(JSON.stringify(category));
  return http.post("/categories", category);
}

function updateCategory(id: number, category: Category) {
  console.log(JSON.stringify(category));
  
  return http.patch(`/categories/${id}`, category);
}

function deleteCategory(id: number) {
  return http.delete(`/categories/${id}`);
}

function searchCategories(query: string) {
  return http.get(`/categories/search`, {
    params: {
      query,
    },
  });
}

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories
};
