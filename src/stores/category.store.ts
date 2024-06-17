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

  watch(selectedCategory, async (value) => {
    if (value === "ทั้งหมด") {
      await productStore.getProductPaginate();
    } else {
      productStore.getProductsByCategory(value);
    }
  });

  // watch for searchQuery
  watch(searchQuery, (value) => {
    if (value === "") {
      getAllCategories();
    } else {
      searchCategory();
    }
  });


  //createCategory use category service
  const getAllCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.data) {

        categories.value = res.data;
  
        // push category All
        categories.value.push({
          categoryId: 0,
          categoryName: "ทั้งหมด",
          haveTopping: false,
        });
        // pop last category out
        categoriesForCreate.value = categories.value.slice(0, categories.value.length - 1);



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

  // searchCategories
  const searchCategory = async () => {
    try {
      const response = await categoryService.searchCategories(searchQuery.value);
      categories.value = response.data;
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
  };
});
