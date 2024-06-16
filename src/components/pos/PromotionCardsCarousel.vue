<script lang="ts" setup>
import { ref, watch, onMounted, nextTick } from 'vue';
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
  if (promotionStore.promotions.length === 0) {
    console.log("No promotions available");
    return;
  }
  for (let i = 0; i < promotionStore.promotions.length; i += chunkSize) {
    chunks.push(promotionStore.promotions.slice(i, i + chunkSize));
  }
  promotionChunks.value = chunks;
  console.log("Chunked Promotions:", promotionChunks.value);
}

onMounted(async () => {
  console.log("Fetching promotions...");
  await promotionStore.getAllPromotions(); // Fetch all promotions from the store
  console.log("Fetched Promotions:", promotionStore.promotions); // Debugging log
  chunkPromotions(); // Chunk promotions after fetching
  await nextTick(); // Ensure DOM update
  console.log("Carousel items rendered");
});

watch(() => promotionStore.promotions, () => {
  console.log("Promotions updated:", promotionStore.promotions); // Debugging log
  chunkPromotions();
}, { immediate: true });

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

function getButtonClass(promotion: Promotion) {
  return isPromotionApplied(promotion) ? 'btn-applied-promotion' : 'btn-apply-promotion';
}
</script>

<template>
  <v-carousel hide-delimiter-background hide-delimiters height="180" style="background-color: #80715E; border-radius: 20px;">
    <v-carousel-item v-for="(chunk, index) in promotionChunks" :key="chunk[index].promotionId">
      <div class="promotion-group">
        <div class="promotion-container">
          <v-card v-for="promotion in chunk" :key="promotion.promotionId" class="promotion-card"
            :class="{ 'applied-promotion': isPromotionApplied(promotion) }" @click="togglePromotion(promotion)">
            <v-card-title class="text-center wrap-text">{{ promotion.promotionName }}</v-card-title>
            <v-card-actions class="justify-center">
              <v-btn
                :class="getButtonClass(promotion)"
                class="btn-apply-promotion"
                @click.stop="togglePromotion(promotion)">
                {{ isPromotionApplied(promotion) ? 'ยกเลิก' : 'ใช้โปรโมชั่นนี้' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </div>
    </v-carousel-item>
  </v-carousel>
</template>




<style scoped>
.promotion-group{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 100%;
}
.promotion-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding-left: 5%;
}

.promotion-card {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border: 2px solid #ff9800;
  border-radius: 10px;
  cursor: pointer;
  padding: 10px 0;
}

.promotion-card.applied-promotion {
  border: 2px solid #C5C5C5;
}

.v-card-title {
  text-align: center;
  font-size: 80%; /* Adjusted font size */
}

.v-card-actions {
  justify-content: center;
  width: 100%;
}

.text-center {
  text-align: center;
  font-size: 85%;
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
  margin-top: 5px;
}

.btn-apply-promotion {
  background-color: #ff9800;
  color: black;
  font-weight: bold;
  padding: 3px 8px;
  width: 100%;
  border-radius: 20px;
}

.btn-applied-promotion {
  background-color: #C5C5C5;
  color: white;
  font-weight: bold;
  padding: 3px 8px;
  width: 100%;
  border-radius: 20px;
}

.wrap-text {
  word-wrap: break-word;
}
</style>

