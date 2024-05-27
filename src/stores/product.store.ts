import { ref } from "vue";
import { defineStore } from "pinia";
import type { Product } from "@/types/product.type";

export const useProductDto = defineStore("product", () => {
  const products = ref<Product>();
  const product = ref<Product>();

  



  return{
    products,
    product
  }
});
