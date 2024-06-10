//create promotino service

import type { Promotion } from "@/types/promotion.type";
import http from "./axios";
function getAllPromotions() {
    return http.get("/promotions");
  }
  
  function getPromotionById(id: number) {
    return http.get(`/promotions/${id}`);
  }
  
  function createPromotion(promotion: Promotion) {
    console.log("Promotion created",JSON.stringify(promotion));
    return http.post("/promotions", promotion);
  }
  
  function updatePromotion(id: number, promotion: Promotion) {
    return http.patch(`/promotions/${id}`, promotion);
  }
  
  function deletePromotion(id: number) {
    return http.delete(`/promotions/${id}`);
  }
  
  function searchPromotions(query: string) {
    return http.get(`/promotions/search`, {
      params: {
        query,
      },
    });
  }
  
  export default {
    getAllPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    searchPromotions,
  };
