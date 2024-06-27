<template>
  <v-text-field
    v-model="searchQuery"
    append-icon="mdi-magnify"
    label="ค้นหา"
    variant="solo"
    single-line
    hide-details
  ></v-text-field>
</template>

<script lang="ts" setup>
import { useProductStore } from '@/stores/product.store';
import { ref, watch, onMounted } from 'vue';

const productStore = useProductStore();
const searchQuery = ref('');

// Initialize the search query with the value from the store
onMounted(() => {
  searchQuery.value = productStore.searchQuery;
  productStore.getAllProducts();
});

// Watch for changes in the search query and update the store accordingly
watch(searchQuery, (newQuery) => {
  productStore.searchQuery = newQuery;
  if (newQuery === '') {
    productStore.getAllProducts();
    
  } else {
    productStore.getProductPaginate();
  }
});
</script>
