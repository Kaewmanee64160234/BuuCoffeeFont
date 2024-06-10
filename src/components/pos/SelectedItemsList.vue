<template>
  <v-card class="selected-items-list">
    <v-card-title>รายการที่เลือก</v-card-title>
    <v-list>
      <v-list-item v-for="(item, index) in selectedItems" :key="index">
        <v-list-item-content>
          <div>
            <strong>{{ item.product.productName }}</strong>
            <div>ประเภท: {{ item.productTypeToppings[0]?.productType.productTypeName }}</div>
            <div>ระดับความหวาน: {{ item.productTypeToppings[0]?.sweetness }}%</div>
            <div v-if="item.productTypeToppings.length > 0">
              ท็อปปิ้ง:
              <ul>
                <li v-for="topping in item.productTypeToppings.map(
                  productTypeTopping => productTypeTopping.topping
                
                )" :key="topping.toppingId">
                  {{ topping.toppingName }} ({{ topping.quantity }})
                </li>
              </ul>
            </div>
          </div>
        </v-list-item-content>
        <v-list-item-content>{{ item.quantity }}</v-list-item-content>
        <v-list-item-content>{{ item.receiptSubTotal }}</v-list-item-content>
        <v-btn @click="removeItem(index)">ลบ</v-btn>
      </v-list-item>
    </v-list>
    <v-card-subtitle>รวมทั้งหมด: {{ totalPrice }}</v-card-subtitle>
  </v-card>
</template>

<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { computed } from 'vue';

const posStore = usePosStore();

const selectedItems = computed(() => posStore.selectedItems);
const totalPrice = computed(() => posStore.totalPrice);

function removeItem(index: number) {
  posStore.removeItem(index);
}
</script>

<style scoped>
.selected-items-list {
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 20px;
}
</style>
