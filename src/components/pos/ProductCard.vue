<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import type { Product } from '@/types/product.type';
import { onMounted } from 'vue';

const props = defineProps<{ product: Product }>();
const productStore = useProductStore();
const posStore = usePosStore();
const url = import.meta.env.VITE_API_URL;

onMounted(() => {
  productStore.setSelectedProduct(props.product);
});

function handleAddToCart() {
  productStore.setSelectedProduct(props.product);
  if (props.product.category.haveTopping) {
    openToppingDialog();
  } else {
    posStore.addToReceipt(props.product, null, [], 1, 0);
  }
  console.log(props.product);
}

// Open topping dialog
function openToppingDialog() {
  posStore.toppingDialog = true;
}
</script>


<template>
  <v-card class="product-card" @click="handleAddToCart">
    <v-img class="product-image" 
      :src="`http://localhost:3000/products/${product.productId}/image`"
      :lazy-src="`http://localhost:3000/products/${product.productId}/image`" />
    <v-card-title class="text-center">{{ product.productName }} {{ product.productPrice }} .-</v-card-title>
  </v-card>
</template>

<style scoped>
.product-card {
  border-radius: 10px;
  width: 100%;
  max-width: 150px; /* Smaller max width for the card */
  height: auto;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin: 10px; /* Margin for spacing between cards */
}

.product-image {
  width: 100%;
  height: 100px; /* Smaller height for the image */
  object-fit: cover;
  border-radius: 10px;
}

.text-center {
  text-align: center;
  width: 100%;
  font-weight: bold;
  color: black;
  font-size: 14px; /* Smaller font size */
}
</style>
