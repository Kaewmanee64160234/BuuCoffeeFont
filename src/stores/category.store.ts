import categoryService from "@/service/category.service";
import type { Category } from "@/types/category.type";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useProductStore } from "./product.store";

export const useCategoryStore = defineStore("category", () => {
  const category = ref<Category>();
  const categories = ref<Category[]>([]);
  const categoriesForCreate = ref<Category[]>([]);
  const selectedCategory = ref("");
  const productStore = useProductStore();
  const searchQuery = ref<string>("");
  const createCategoryDialog = ref(false);
  const updateCategoryDialog = ref(false);

  watch(selectedCategory, (value) => {
    if (value === "All") {
      productStore.getAllProducts();
    } else {
      productStore.getProductsByCategory(value);
    }
  });

  //createCategory use category service
  const getAllCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.data) {
        categoriesForCreate.value = res.data;

        categories.value = res.data;
        // push category All
        // categories.value.push({
        //   categoryId: 0,
        //   categoryName: "All",
        //   haveTopping: false,
        // });
      }
    } catch (error) {
      console.error(error);
    }
  };

  //createCategory use category service
  const createCategory = async (category: Category) => {
    try {
      const res = await categoryService.createCategory(category);
      if (res.data) {
        categories.value.push(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  //updateCategory use category service

  const updateCategory = async (id: number, category: Category) => {
    try {
      const res = await categoryService.updateCategory(id, category);
      if (res.data) {
        const index = categories.value.findIndex((c) => c.categoryId === id);
        categories.value[index] = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //deleteCategory use category service

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      categories.value = categories.value.filter((c) => c.categoryId !== id);
    } catch (error) {
      console.error(error);
    }
  };

  //getCategoryById use category service

  const getCategoryById = async (id: number) => {
    try {
      const res = await categoryService.getCategoryById(id);
      if (res.data) {
        category.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    category,
    categories,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    selectedCategory,
    categoriesForCreate,
    searchQuery,
    createCategoryDialog,
    updateCategoryDialog,
  };
});
