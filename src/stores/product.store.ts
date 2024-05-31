import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { Product } from "@/types/product.type";
import productService from "@/service/product.service";
import type { Category } from "@/types/category.type";
import { useCategoryStore } from "./category.store";

export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>();
  const product = ref<Product& { file: File }>({
    productId: 0,
    productName: "",
    productPrice: 0,
    productImage: "",
    category:{
      categoryId:0,
      categoryName: "",
      haveTopping: false,
    },
    file: new File([""], "filename"),
  });
  const searchQuery = ref<string>("");
  const createProductDialog = ref(false);
  const selectedCategoryName = ref<string>("");
  const categoryStore = useCategoryStore();
  
  // watch if selectedCategoryName changes map products by category
  watch(selectedCategoryName, (value) => {
    if (value != "All") {
      product.value.category = categoryStore.categoriesForCreate.map(category => category.categoryName === value ? category : product.value.category)[0];

    } 
  });


  const getAllProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.status === 200) {
        console.log('getAllProducts', response.data);
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //get product by id
  const getProductById = async (id: number) => {
    try {
      const response = await productService.getProductById(id);
      if (response.status === 200) {
        product.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //create product
  const createProduct = async () => {
    try {
      const response = await productService.createProduct(product.value!);
      if (response.status === 201) {
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //update product
  const updateProduct = async (id: number, product: Product) => {
    try {
      const response = await productService.updateProduct(id, product);
      if (response.status === 200) {
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //delete product
  const deleteProduct = async (id: number) => {
    try {
      const response = await productService.deleteProduct(id);
      if (response.status === 200) {
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  //upload image
  const uploadImage = async (file: File, productId: number) => {
    try {
      const response = await productService.uploadImage(file, productId);
      if (response.status === 200) {
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // getProductsByCategory
  const getProductsByCategory = async (category: string) => {
    try {
      const response = await productService.getProductsByCategory(category);
      if (response.status === 200) {
        console.log('getProductsByCategory', response.data);
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };


  return {
    products,
    product,

    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    searchQuery,
    getProductsByCategory,
    createProductDialog,
    selectedCategoryName
  };
});
