<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import { usePromotionStore } from '@/stores/promotion.store';
import type { Promotion } from '@/types/promotion.type';
import Swal from 'sweetalert2';
import type { ReceiptItem } from '@/types/receipt.type';

const posStore = usePosStore();
const promotionStore = usePromotionStore();

const dialog = ref(false);
const selectedPromotion = ref<Promotion | null>(null);
const selectedReceiptItem = ref<ReceiptItem>();


const itemsWithToppings = computed(() => 
  posStore.selectedItems.filter(item => item.product?.category.haveTopping)
);

const applySelectedPromotion = () => {
  if (promotionStore.promotion && selectedReceiptItem.value) {
    posStore.selectUsePointDialog = false;

    Swal.fire({
      title: 'ยืนยันการใช้โปรโมชั่น?',
      text: `คุณต้องการใช้โปรโมชั่นกับสินค้า ${selectedReceiptItem.value.product?.productName} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ใช้โปรโมชั่น!'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("กำลังใช้โปรโมชั่น", promotionStore.promotion, selectedReceiptItem.value);
        posStore.applyPromotion(promotionStore.promotion, selectedReceiptItem.value);
        posStore.selectUsePointDialog = false;
      
      }
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "เลือกโปรโมชั่นและสินค้า",
      text: "กรุณาเลือกโปรโมชั่นและสินค้าเพื่อใช้",
    });
  }
};

const handleReceiptItemClick = (item:ReceiptItem) => {
  selectedReceiptItem.value = item;
};
</script>



<template>
  <div>
    <v-dialog v-model="posStore.selectUsePointDialog" max-width="600px">
      <v-card>
        <v-card-title>เลือกสินค้าและโปรโมชั่น</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="item in itemsWithToppings"
              :key="item"
              @click="handleReceiptItemClick(item)"
              :class="{ 'selected-item': selectedReceiptItem === item }"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.product?.productName }}
                  <template v-if="item.productTypeToppings.length > 0">
                    ({{ item.productTypeToppings.join(', ') }})
                  </template>
                </v-list-item-title>
                <v-list-item-subtitle>
                  จำนวน: {{ item.quantity }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list>
      
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="applySelectedPromotion">Apply Promotion</v-btn>
          <v-btn @click="posStore.selectUsePointDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

  

<style scoped>
.selected-item {
  background-color: #e0e0e0;
}
</style>
