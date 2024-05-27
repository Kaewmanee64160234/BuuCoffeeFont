import { ref } from "vue";
import { defineStore } from "pinia";
import type { Product } from "@/types/product.type";
import productService from "@/service/product.service";

export const useProductStore = defineStore("product", () => {
  const products = ref<Product>();
  const product = ref<Product>();

  const getAllProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.status === 200) {
        products.value = response.data;
        console.log(products.value);
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
  const createProduct = async (product: Product) => {
    try {
      const response = await productService.createProduct(product);
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

  return {
    products,
    product,

    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage
  };
});
