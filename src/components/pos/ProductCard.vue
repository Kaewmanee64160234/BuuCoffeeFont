<template>
  <v-card class="product-card">
    <v-img :src="product.productImage" height="200px"></v-img>
    <v-card-title class="text-center">{{ product.productName }}</v-card-title>
    <v-card-subtitle class="text-center">{{ product.productPrice }}</v-card-subtitle>
    <v-card-actions class="justify-center">
      <v-btn color="primary" @click="handleAddToCart">เพิ่มในตะกร้า</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import type { Product } from '@/types/product.type';
import { onMounted } from 'vue';



const props = defineProps<{ product: Product }>();
const productStore = useProductStore();
const posStore = usePosStore();
onMounted(() => {
  productStore.setSelectedProduct(props.product);
});

function handleAddToCart() {
  productStore.setSelectedProduct(props.product);
  if (props.product.category.haveTopping) {
    openToppingDialog();
  } else {
    posStore.addToReceipt(props.product, null, [], 1,0);
  }
  console.log(props.product);

}

// open toppingDialog
function openToppingDialog() {
  posStore.toppingDialog = true;
}

</script>

<style scoped>
.product-card {
  background-color: #f5f5f5;
  /* Adjust the color to match your design */
  border-radius: 10px;
}

.text-center {
  text-align: center;
}

.justify-center {
  justify-content: center;
}
</style>