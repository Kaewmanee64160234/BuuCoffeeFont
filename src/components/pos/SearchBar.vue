<template>
    <v-text-field
      v-model="searchQuery"
      append-icon="mdi-magnify"
      label="ค้นหา"
      solo
      single-line
      hide-details
    ></v-text-field>
  </template>
  
  
  <script lang="ts" setup>
  import { useProductStore } from '@/stores/product.store';
import { ref, watch } from 'vue';
  
  const productStore = useProductStore();
  const searchQuery = ref('');
  
  searchQuery.value = productStore.searchQuery;
  
  watch(searchQuery, (newQuery) => {
    productStore.searchQuery = newQuery;
    productStore.getProductPaginate();
  });
  </script>
  