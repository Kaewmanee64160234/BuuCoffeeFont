import { ref } from 'vue';
import { defineStore } from 'pinia';
import financeService from '@/service/report/finance.service';
import type { ProductUsage } from '@/types/report/productUsage.type';
import type { IngredientUsage } from '@/types/report/ingredientUsage.type';

export const useProductUsageStore = defineStore('productUsage', () => {
  const productsUsage = ref<ProductUsage[]>([]);
  const ingredientsUsage = ref<IngredientUsage[]>([]);

  const loadProductsUsage = async (startDate?: string, endDate?: string, receiptType?: string) => {
    try {
      const res = await financeService.getProductsUsage(startDate, endDate, receiptType);
      console.log('Products Usage API response:', res);
      if (res.data) {
        productsUsage.value = res.data.productsUsage;
      }
    } catch (error) {
      console.error('Failed to load products usage', error);
    }
  };

  const loadIngredientsUsage = async (startDate?: string, endDate?: string) => {
    try {
      const res = await financeService.getIngradientsUsage(startDate, endDate);
      console.log('Ingredients Usage API response:', res);
      if (res.data && res.data.ingredients) {
        ingredientsUsage.value = res.data.ingredients;
      } else {
        console.error('Invalid data structure:', res);
      }
    } catch (error) {
      console.error('Failed to load ingredients usage', error);
    }
  };
  
  return {
    productsUsage,
    ingredientsUsage,
    loadProductsUsage,
    loadIngredientsUsage
  };
});
