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
  const currentPage = ref(1);
  const itemsPerPage = ref(5);
  const totalItems = ref(0);
  const promotionTypes = [
    { text: "ส่วนลดเป็นจำนวนเงิน", value: "discountPrice" },
    { text: "ซื้อ 1 แถม 1", value: "buy1get1" },
    { text: "ใช้คะแนนแลกส่วนลด", value: "usePoints" },
    { text: "ส่วนลดเป็นเปอร์เซ็นต์", value: "discountPercentage" },
  ];

  // Watch for searchQuery
  watch(searchQuery, (value) => {
    console.log(value);
    if (value === "") {
      getAllPromotions();
    } else {
      searchPromotion();
    }
  });

  watch([searchQuery, currentPage], async () => {
    await getPromotionsPaginate();
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

  const getPromotionsPaginate = async () => {
    try {
      const res = await promotionService.getPromotionsPaginate({
        search: searchQuery.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
      });
      if (res.data) {
        promotions.value = res.data.data;
        totalItems.value = res.data.total;

        console.log(res.data);
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
        getPromotionsPaginate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Update an existing promotion
  const updatePromotion = async (id: number, promotion: Promotion) => {
    try {
      console.log(JSON.stringify(promotion));
      const res = await promotionService.updatePromotion(id, promotion);
      if (res.data) {
        const index = promotions.value.findIndex((p) => p.promotionId === id);
        promotions.value[index] = res.data;
        await getPromotionsPaginate();
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
      const response = await promotionService.searchPromotions(
        searchQuery.value
      );
      promotions.value = response.data;
      console.log(response.data);
    } catch (error) {
      console.error("Error searching promotions:", error);
    }
  };

  // get promotion by type
  const getPromotionByType = async (type: string) => {
    try {
      const res = await promotionService.getPromotionByType(type);
      if (res.data) {
        promotions.value = res.data;
      }
    } catch (error) {
      console.error(error);
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
    searchPromotion,
    currentPage,
    itemsPerPage,
    getPromotionsPaginate,
    totalItems,
    promotionTypes,
    getPromotionByType,
  };
});
