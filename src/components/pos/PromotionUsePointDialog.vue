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
    <v-dialog v-model="posStore.selectUsePointDialog" max-width="800px">
      <v-card>
        <v-card-title class="headline" style="font-size: 24px; font-weight: bold;">เลือกสินค้าและโปรโมชั่น</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item
                  v-for="item in itemsWithToppings"
                  :key="item.product!.productId"
                  @click="handleReceiptItemClick(item)"
                  :class="{ 'selected-item': selectedReceiptItem === item }"
                >
                  <v-list-item-content>
                    <v-list-item-title style="font-size: 18px;">
                      {{ item.product?.productName }}
                      <template v-if="item.productTypeToppings.length > 0">
                        ({{ item.productTypeToppings.map(t => t.topping?.toppingName).join(', ') }})
                      </template>
                    </v-list-item-title>
                    <v-list-item-subtitle style="font-size: 16px;">
                      จำนวน: {{ item.quantity }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedReceiptItem">
              <v-card>
                <v-card-title class="headline" style="font-size: 20px; font-weight: bold;">รายละเอียดสินค้า</v-card-title>
                <v-card-text>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 18px;">
                        ชื่อสินค้า: {{ selectedReceiptItem.product?.productName }}
                      </v-list-item-title>
                      <v-list-item-subtitle style="font-size: 16px;">
                        จำนวน: {{ selectedReceiptItem.quantity }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle style="font-size: 16px;">
                        ราคา: {{ selectedReceiptItem.product?.productPrice }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle style="font-size: 16px;" v-if="selectedReceiptItem.productTypeToppings.length > 0">
                        ท็อปปิ้ง: {{ selectedReceiptItem.productTypeToppings.map(t => t.topping?.toppingName).join(', ') }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle style="font-size: 16px;">
                        หมวดหมู่: {{ selectedReceiptItem.product?.category.categoryName }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
   
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" style="font-size: 16px;" @click="applySelectedPromotion">ใช้โปรโมชั่น</v-btn>
          <v-btn style="font-size: 16px;" @click="posStore.selectUsePointDialog = false">ยกเลิก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<style scoped>
.selected-item {
  background-color: #e0e0e0;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px;
}

.v-card-title {
  font-size: 24px !important;
  font-weight: bold !important;
}

.v-list-item-title {
  font-size: 18px !important;
}

.v-list-item-subtitle {
  font-size: 16px !important;
}

.v-btn {
  font-size: 16px !important;
}
</style>
