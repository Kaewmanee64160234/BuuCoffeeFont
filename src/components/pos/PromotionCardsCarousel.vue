<script lang="ts" setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import { usePromotionStore } from '@/stores/promotion.store';
import type { Promotion } from '@/types/promotion.type';
import Swal from 'sweetalert2';
import { useUserStore } from '@/stores/user.store';
import type { ReceiptItem } from '@/types/receipt.type';

const posStore = usePosStore();
const promotionStore = usePromotionStore();
const userStore = useUserStore();
const coutingCup = ref(0);

const promotionChunks = ref<Promotion[][]>([]);

function chunkPromotions() {
  const chunkSize = 4;
  const chunks: Promotion[][] = [];
  if (promotionStore.promotions.length === 0) {
    console.log("ไม่มีโปรโมชั่นที่พร้อมใช้งาน");
    return;
  }
  for (let i = 0; i < promotionStore.promotions.length; i += chunkSize) {
    chunks.push(promotionStore.promotions.slice(i, i + chunkSize));
  }
  promotionChunks.value = chunks;
  console.log("โปรโมชั่นที่แบ่งเป็นกลุ่ม:", promotionChunks.value);
}

onMounted(async () => {
  console.log("กำลังดึงข้อมูลโปรโมชั่น...");
  await promotionStore.getAllPromotions();
  console.log("โปรโมชั่นที่ดึงข้อมูลมา:", promotionStore.promotions);
  chunkPromotions();
  await nextTick();
  console.log("ไอเท็มคารูเซลที่เรนเดอร์");
});

watch(() => promotionStore.promotions, () => {
  console.log("โปรโมชั่นที่อัปเดต:", promotionStore.promotions);
  chunkPromotions();
});

function applyPromotion(promotion: Promotion) {
  console.log("กำลังใช้โปรโมชั่น:", promotion);
  if (posStore.selectedItems.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'ไม่มีรายการ',
      text: 'คุณไม่สามารถใช้โปรโมชั่นได้เนื่องจากไม่มีรายการในใบเสร็จ',
      confirmButtonText: 'ตกลง'
    });
    return;
  }
  if (promotion.promotionName == "นำแก้วมา 🌏") {
    const numberOfCups = posStore.selectedItems.reduce((acc, item) => {
      if (item.product?.haveTopping) {
        return acc + item.quantity;
      }
      return acc; 
    }, 0);

    coutingCup.value += 1;
    if (coutingCup.value > numberOfCups) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถใช้โปรโมชั่นได้',
        text: 'คุณใช้โปรโมชั่นนี้ไปแล้ว',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
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
  <v-container>
    <v-carousel hide-delimiter-background hide-delimiters height="180"
      style="background-color: #80715E; border-radius: 20px;">
      <template v-if="userStore.currentUser.userRole == 'พนักงานขายข้าว'">
        <v-carousel-item v-for="(chunk, index) in promotionChunks" :key="chunk[index]">


          <div class="promotion-group">
            <div class="promotion-container">
              <v-card v-for="promotion in chunk" :key="promotion.promotionId" class="promotion-card"
                :class="{ 'applied-promotion': isPromotionApplied(promotion) }" @click="togglePromotion(promotion)">
                <v-card-title class="text-center wrap-text">{{ promotion.promotionName }}</v-card-title>
                <v-card-actions class="justify-center">
                  <v-btn v-if="!promotion.promotionCanUseManyTimes" :class="getButtonClass(promotion)"
                    class="btn-apply-promotion" @click.stop="togglePromotion(promotion)">
                    {{ isPromotionApplied(promotion) ? 'ยกเลิก' : 'ใช้โปรโมชั่นนี้' }}
                  </v-btn>
                  <v-btn v-else class="btn-apply-promotion" @click.stop="applyPromotion(promotion)">
                    ใช้โปรโมชั่นนี้
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
        </v-carousel-item>
      </template>
      <template v-else>

        <v-carousel-item v-for="(chunk, index) in promotionChunks" :key="chunk[index]">
          <div class="promotion-group">
            <div class="promotion-container">
              <v-card v-for="promotion in chunk" :key="promotion.promotionId" class="promotion-card"
                :class="{ 'applied-promotion': isPromotionApplied(promotion) }" @click="togglePromotion(promotion)">
                <v-card-title class="text-center wrap-text">{{ promotion.promotionName }}</v-card-title>
                <v-card-actions class="justify-center">
                  <v-btn v-if="!promotion.promotionCanUseManyTimes" :class="getButtonClass(promotion)"
                    class="btn-apply-promotion" @click.stop="togglePromotion(promotion)">
                    {{ isPromotionApplied(promotion) ? 'ยกเลิก' : 'ใช้โปรโมชั่นนี้' }}
                  </v-btn>
                  <v-btn v-else class="btn-apply-promotion" @click.stop="applyPromotion(promotion)">
                    ใช้โปรโมชั่นนี้
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
        </v-carousel-item>
      </template>
    </v-carousel>
  </v-container>
</template>

<style scoped>
.promotion-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 100%;
}

.promotion-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 100%;
}

.promotion-card {
  width: 160px;
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
  font-size: 80%;
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
