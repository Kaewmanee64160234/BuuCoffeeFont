import promotionService from "@/service/promotion.service";
import type { Promotion } from "@/types/promotion.type";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const usePromotionStore = defineStore("promotion", () => {
    const promotion = ref<Promotion | null>(null);
    const promotions = ref<Promotion[]>([]);
    const searchQuery = ref<string>("");
    const createPromotionDialog = ref(false);
    const updatePromotionDialog = ref(false);
  
    // Watch for searchQuery
    watch(searchQuery, (value) => {
      console.log(value);
      if (value === "") {
        getAllPromotions();
      } else {
        searchPromotion();
      }
    });
  
    // Fetch all promotions
    const getAllPromotions = async () => {
      try {
        const res = await promotionService.getAllPromotions();
        if (res.data) {
          promotions.value = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Create a new promotion
    const createPromotion = async (promotion: Promotion) => {
      try {
        const res = await promotionService.createPromotion(promotion);
        if (res.data) {
          promotions.value.push(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Update an existing promotion
    const updatePromotion = async (id: number, promotion: Promotion) => {
      try {
        const res = await promotionService.updatePromotion(id, promotion);
        if (res.data) {
          const index = promotions.value.findIndex((p) => p.promotionId === id);
          promotions.value[index] = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Delete a promotion
    const deletePromotion = async (id: number) => {
      try {
        await promotionService.deletePromotion(id);
        promotions.value = promotions.value.filter((p) => p.promotionId !== id);
      } catch (error) {
        console.error(error);
      }
    };
  
    // Get promotion by ID
    const getPromotionById = async (id: number) => {
      try {
        const res = await promotionService.getPromotionById(id);
        if (res.data) {
          promotion.value = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Search promotions
    const searchPromotion = async () => {
      try {
        const response = await promotionService.searchPromotions(searchQuery.value);
        promotions.value = response.data;
        console.log(response.data);
      } catch (error) {
        console.error('Error searching promotions:', error);
      }
    };
  
    return {
      promotion,
      promotions,
      getAllPromotions,
      createPromotion,
      updatePromotion,
      deletePromotion,
      getPromotionById,
      searchQuery,
      createPromotionDialog,
      updatePromotionDialog,
    };
  });