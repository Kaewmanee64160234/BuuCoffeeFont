import { reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import { mapToProduct, type Product } from "@/types/product.type";
import productService from "@/service/product.service";
import type { Category } from "@/types/category.type";
import { useCategoryStore } from "./category.store";
import type { IngredientQuantities, ProductType } from "@/types/productType.type";

export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>([]);
  const updateProductDialog = ref(false);
  const createProductDialog = ref(false);
  const searchQuery = ref<string>("");

  const product = ref<Product & { file: File }>({
    productId: 0,
    productName: "",
    productPrice: 0,
    productImage: "",
    category: {
      categoryId: 0,
      categoryName: "",
      haveTopping: false,
    },
    file: new File([""], "filename"),
    productTypes: [],
  });

  const productName = ref<string>("");
  const productPrice = ref<number>(0);
  const selectedCategory = ref<string | null>(null);
  const imagePreview = ref<string | null>(null);

  const selectedIngredientsHot = ref<number[]>([]);
  const selectedIngredientsCold = ref<number[]>([]);
  const selectedIngredientsBlend = ref<number[]>([]);
  const ingredientQuantitiesHot = ref<IngredientQuantities>({});
  const ingredientQuantitiesCold = ref<IngredientQuantities>({});
  const ingredientQuantitiesBlend = ref<IngredientQuantities>({});
  const productTypes = ref<ProductType[]>([]);
  const isHot = ref<boolean>(false);
  const isCold = ref<boolean>(false);
  const isBlend = ref<boolean>(false);

  const categoryStore = useCategoryStore();

  // watch if selectedCategory changes map products by category
  watch(selectedCategory, (value) => {
    if (value != "All") {
      product.value.category =
        categoryStore.categoriesForCreate.find(
          (category) => category.categoryName === value
        ) || product.value.category;
    }
  });

  const getAllProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.status === 200) {
        console.log(response.data);
      //  use map to Product with array products
        products.value = response.data.map( (product: any) => mapToProduct(product));

      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const createProduct = async () => {
    try {
      const response = await productService.createProduct(product.value!);
      if (response.status === 201) {
        await uploadImage(product.value.file, response.data.productId);
        await getAllProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async (id: number, updatedProduct: Product) => {
    try {
      const response = await productService.updateProduct(id, updatedProduct);
   console.log("updateProduct", response.status);
        await getAllProducts();
      
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const response = await productService.deleteProduct(id);
      if (response.status === 200) {
        await getAllProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImage = async (file: File, productId: number) => {
    try {
      const response = await productService.uploadImage(file, productId);
      if (response.status === 201) {
        console.log("uploadImage", response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProductsByCategory = async (category: string) => {
    try {
      const response = await productService.getProductsByCategory(category);
      if (response.status === 200) {
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    products,
    product,
    productName,
    productPrice,
    selectedCategory,
    imagePreview,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    searchQuery,
    getProductsByCategory,
    createProductDialog,
    updateProductDialog,
    selectedIngredientsHot,
    selectedIngredientsCold,
    selectedIngredientsBlend,
    ingredientQuantitiesHot,
    ingredientQuantitiesCold,
    ingredientQuantitiesBlend,
    productTypes,
    isHot,
    isCold,
    isBlend,
  };
});
