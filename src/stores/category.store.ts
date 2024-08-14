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

  const currentPage = ref(1); // Current page number
  const itemsPerPage = ref(5); // Number of items per page
  const totalCategories = ref(0); // Total number of categories

  watch(selectedCategory, async (value) => {
    if (value === "ทั้งหมด") {
      await productStore.getProductPaginate();
    } else {
      productStore.getProductsByCategory(value);
    }
  });

  watch(searchQuery, (value) => {
    if (value === "") {
      getAllCategories();
    } else {
      searchCategory();
    }
  });

  const getAllCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.data) {
        categories.value = res.data;

        // Add "ทั้งหมด" category
        categories.value.push({
          categoryId: 0,
          categoryName: "ทั้งหมด",
          haveTopping: false,
        });

        categoriesForCreate.value = categories.value.slice(0, categories.value.length - 1);
        totalCategories.value = categoriesForCreate.value.length; // Update total categories count
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createCategory = async (category: Category) => {
    try {
      const res = await categoryService.createCategory(category);
      if (res.data) {
        categories.value.push(res.data);
        getAllCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateCategory = async (id: number, category: Category) => {
    try {
      const res = await categoryService.updateCategory(id, category);
      if (res.data) {
        const index = categories.value.findIndex((c) => c.categoryId === id);
        categories.value[index] = res.data;
        getAllCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      categories.value = categories.value.filter((c) => c.categoryId !== id);
      totalCategories.value = categories.value.length; // Update total categories count
    } catch (error) {
      console.error(error);
    }
  };

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

  const searchCategory = async () => {
    try {
      const response = await categoryService.searchCategories(searchQuery.value);
      categories.value = response.data;
      totalCategories.value = categories.value.length; // Update total categories count
    } catch (error) {
      console.error('Error searching categories:', error);
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
    currentPage,
    itemsPerPage,
    totalCategories,
  };
});
