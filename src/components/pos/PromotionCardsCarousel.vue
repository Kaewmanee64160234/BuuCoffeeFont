<template>
  <v-carousel hide-delimiters height="230" style="background-color: #80715E; border-radius: 30px;">
    <v-carousel-item v-for="(chunk, index) in promotionChunks" :key="index">
      <div class="promotion-container">
        <v-card v-for="promotion in chunk" :key="promotion.promotionId" class="promotion-card"
          :class="{ 'applied-promotion': isPromotionApplied(promotion) }" @click="togglePromotion(promotion)">
          <v-card-title class="text-center wrap-text">{{ promotion.promotionName }}</v-card-title>
          <v-card-actions class="justify-center">
            <v-btn v-if="promotion.promotionCanUseManyTimes == false" class="btn-apply-promotion"
              @click.stop="togglePromotion(promotion)">
              {{ isPromotionApplied(promotion) ? 'ยกเลิก' : 'ใช้โปรโมชั่นนี้' }}
            </v-btn>
            <v-btn v-else class="btn-apply-promotion" @click.stop="applyPromotion(promotion)">
              ใช้โปรโมชั่นนี้
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-carousel-item>
  </v-carousel>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import { usePromotionStore } from '@/stores/promotion.store';
import type { Promotion } from '@/types/promotion.type';
import Swal from 'sweetalert2';

const posStore = usePosStore();
const promotionStore = usePromotionStore();

const promotionChunks = ref<Promotion[][]>([]);

function chunkPromotions() {
  const chunkSize = 4;
  const chunks: Promotion[][] = [];
  for (let i = 0; i < promotionStore.promotions.length; i += chunkSize) {
    chunks.push(promotionStore.promotions.slice(i, i + chunkSize));
  }
  promotionChunks.value = chunks;
}

onMounted(async () => {
  await promotionStore.getAllPromotions(); // Assuming there's a method to fetch all promotions
  chunkPromotions();
});

watch(() => promotionStore.promotions, chunkPromotions, { immediate: true });

function applyPromotion(promotion: Promotion) {
  if (posStore.selectedItems.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'No Items',
      text: 'You cannot apply a promotion because there are no items in the receipt.',
    });
    return;
  }

  posStore.applyPromotion(promotion);
}

function removePromotion(promotion: Promotion) {
  posStore.removePromotion(promotion);
}

function togglePromotion(promotion: Promotion) {
  if (isPromotionApplied(promotion)) {
    removePromotion(promotion);
  } else {
    applyPromotion(promotion);
  }
}

function isPromotionApplied(promotion: Promotion) {
  return posStore.receipt.receiptPromotions.some(
    (receiptPromotion) => receiptPromotion.promotion.promotionId === promotion.promotionId
  );
}
</script>


<style scoped>
.promotion-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  height: 100%;
  padding-left: 10%;
}

.promotion-card {
  width: 150px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 2px solid #ff9800;
  border-radius: 10px;
  cursor: pointer;
  padding: 20px 0;
}

.promotion-card.applied-promotion {
  border: 2px solid #42a5f5;
}

.v-card-title {
  text-align: center;
}

.v-card-actions {
  justify-content: center;
  width: 100%;
}

.text-center {
  text-align: center;
  font-size: 95%;
  font-weight: bold;
}

.justify-center {
  justify-content: center;
}

.v-carousel-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.center-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.btn-apply-promotion {
  background-color: #ff9800;
  color: black;
  font-weight: bold;
  padding: 5px 10px;
  width: 100%;
  border-radius: 20px;
}

.wrap-text {
  word-wrap: break-word;
}
</style>
