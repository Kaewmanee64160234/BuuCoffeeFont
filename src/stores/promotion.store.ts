import promotionService from "@/service/promotion.service";
import { mapToPromotion, type Promotion } from "@/types/promotion.type";
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
  const totalPromotions = ref(0);
  
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

  watch([searchQuery, currentPage,itemsPerPage], async () => {
    await getPromotionPaginate();
  });

  // Fetch all promotions
  const getAllPromotions = async () => {
    try {
      const response = await promotionService.getAllPromotions();
      if (response.status === 200) {
        promotions.value = response.data;
        totalPromotions.value = promotions.value.length; // Update total users count
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getPromotionPaginate = async () => {
    try {
      const response = await promotionService.getPromotionPaginate(
        currentPage.value,
        itemsPerPage.value,
        searchQuery.value
      );
      console.log("getPromotionPaginate", response.data);
      if (response.status === 200) {
        promotions.value = response.data.data.map((promotion: any) =>
          mapToPromotion(promotion)
        );
        console.log("promotions", promotions.value);
        totalPromotions.value = response.data.total;
      }
    } catch (error) {
      // console.error(error);
      console.log("error", error);
    }
  };

  // Create a new promotion
  const createPromotion = async (promotion: Promotion) => {
    try {
      const response = await promotionService.createPromotion(promotion);
      if (response.status === 201) {
        promotions.value.push(response.data); // เพิ่มผู้ใช้ใหม่เข้าในลิสต์โดยตรง
        totalPromotions.value += 1; // อัปเดตจำนวนผู้ใช้ทั้งหมด
  
        // ตรวจสอบว่ามีผู้ใช้เกินจำนวนที่แสดงต่อหน้าได้หรือไม่
        const totalPages = Math.ceil(totalPromotions.value / itemsPerPage.value);
        if (currentPage.value < totalPages) {
          currentPage.value = totalPages; // เปลี่ยนไปยังหน้าสุดท้าย
        }
  
        // ตรวจสอบถ้าเราอยู่ในหน้าสุดท้าย ให้เรียกเพจจิเนชันเพื่อโหลดข้อมูลผู้ใช้ทั้งหมดใหม่
        if (promotions.value.length > currentPage.value * itemsPerPage.value) {
          await getPromotionPaginate();
        }
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
        await getPromotionPaginate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete a promotion
  const deletePromotion = async (id: number) => {
    try {
      const response = await promotionService.deletePromotion(id);
      if (response.status === 200) {
        promotions.value = promotions.value.filter((promotion) => promotion.promotionId !== id);
        totalPromotions.value = promotions.value.length; // Update total users count
      }
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
    getPromotionPaginate,
    totalPromotions,
    promotionTypes,
    getPromotionByType,
  };
});
