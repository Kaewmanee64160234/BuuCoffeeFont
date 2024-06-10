<template>
    <v-carousel hide-delimiter-background height="250px">
      <v-carousel-item v-for="(chunk, index) in promotionChunks" :key="index">
        <div class="promotion-container">
          <v-card
            v-for="promotion in chunk"
            :key="promotion.promotionId"
            class="promotion-card"
          >
            <v-card-title class="text-center">{{ promotion.promotionName }}</v-card-title>
            <v-card-actions class="justify-center">
              <v-btn color="primary" @click="applyPromotion(promotion)">
                Apply
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-carousel-item>
    </v-carousel>
  </template>
  
  <script lang="ts" setup>
  import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import { usePromotionStore } from '@/stores/promotion.store';
import type { ReceiptPromotion } from '@/types/receiptPromotion.type';
import { ref, computed, onMounted } from 'vue';

  
  const posStore = usePosStore();
  const promotionStore = usePromotionStore();
  onMounted(() => {
    promotionStore.getAllPromotions();
  });
  
  interface Promotion {
    id: number;
    title: string;
    buttonText: string;
  }
  

  
  const promotionChunks = computed(() => {
    const chunkSize = 4;
    const chunks = [];
    for (let i = 0; i < promotionStore.promotions.length; i += chunkSize) {
      chunks.push(promotionStore.promotions.slice(i, i + chunkSize));
    }
    return chunks;
  });
  
  function applyPromotion(promotion: Promotion) {
    const receiptPromotion: ReceiptPromotion = {
      receiptPromId: Date.now(),
      receipt: {} as any,
      promotion: {} as any,
      discount: 10,
      date: new Date(),
    };
    posStore.applyPromotion(receiptPromotion);
  }
  </script>
  
  <style scoped>
  .promotion-container {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  
  .promotion-card {
    width: 200px;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5; /* Adjust the color to match your design */
    border-radius: 10px;
  }
  
  .text-center {
    text-align: center;
  }
  
  .justify-center {
    justify-content: center;
  }
  </style>
  