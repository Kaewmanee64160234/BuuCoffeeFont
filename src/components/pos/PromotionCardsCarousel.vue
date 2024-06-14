<template>
  <v-carousel hide-delimiter-background height="160">
    <v-carousel-item v-for="(chunk, index) in promotionChunks" :key="index">
      <div class="promotion-container">
        <v-card 
          v-for="promotion in chunk" 
          :key="promotion.promotionId" 
          class="promotion-card"
          :class="{'applied-promotion': isPromotionApplied(promotion)}"
          @click="togglePromotion(promotion)"
        >
          <v-card-title class="text-center">{{ promotion.promotionName }}</v-card-title>
          <v-card-actions class="justify-center">
            <v-btn color="primary" @click.stop="togglePromotion(promotion)">
              {{ isPromotionApplied(promotion) ? 'Unselect' : 'Apply' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-carousel-item>
  </v-carousel>
</template>

<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { usePromotionStore } from '@/stores/promotion.store';
import { computed } from 'vue';
import Swal from 'sweetalert2';

const posStore = usePosStore();
const promotionStore = usePromotionStore();

interface Promotion {
  promotionId: number;
  promotionName: string;
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
  console.log(isPromotionApplied(promotion));
  
  if (isPromotionApplied(promotion)) {
    removePromotion(promotion);
  } else {
    applyPromotion(promotion);
  }
}

function isPromotionApplied(promotion: Promotion) {
  return posStore.receiptPromotions.some(
    (receiptPromotion) => receiptPromotion.promotion.promotionId === promotion.promotionId
  );
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
  background-color: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
}

.promotion-card.applied-promotion {
  border: 2px solid #42a5f5; /* Highlight color for applied promotion */
}

.text-center {
  text-align: center;
}

.justify-center {
  justify-content: center;
}
</style>
