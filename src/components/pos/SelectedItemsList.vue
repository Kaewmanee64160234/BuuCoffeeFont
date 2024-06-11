<template>
  <v-card class="selected-items-list">
    <v-card-title>รายการที่เลือก</v-card-title>
    <v-list>
      <v-list-item v-for="(item, index) in selectedItems" :key="index">
        <v-list-item-content>- {{ item.product?.productName }}</v-list-item-content>
        <v-list-item-content>- {{ item.product?.productPrice}}</v-list-item-content>
          <v-list-item-content>- {{ item.quantity }}</v-list-item-content>
          <v-list-item-content>- {{ item.subTotal }}</v-list-item-content>
        <v-btn @click="removeItem(index)">ลบ</v-btn>
      </v-list-item>
    </v-list>
    <v-card-subtitle>รวมทั้งหมด: {{ productStore.totalProducts }}</v-card-subtitle>
  </v-card>
</template>

<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import { computed } from 'vue';


const posStore = usePosStore();

const selectedItems = computed(() => posStore.selectedItems);
const totalPrice = computed(() => posStore.totalPrice);
const productStore = useProductStore();

function removeItem(index: number) {
  posStore.removeItem(index);
}
</script>
<style scoped>
.selected-items-list {
  background-color: #f5f5f5;
  /* Adjust the color to match your design */
  border-radius: 10px;
}
</style>