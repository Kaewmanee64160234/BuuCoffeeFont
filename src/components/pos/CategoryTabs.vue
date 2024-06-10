<template>
    <v-tabs v-model="selectedCategory" background-color="#f5f5f5">
      <v-tab v-for="category in categoryStore.categories" :key="category.categoryId">
        {{ category.categoryName }}
      </v-tab>
    </v-tabs>
  </template>
  
  <script lang="ts" setup>
  import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import { ref, watch } from 'vue';
  
  const productStore = useProductStore();
  const categoryStore = useCategoryStore();
  const selectedCategory = ref('');
  
  watch(selectedCategory, (newCategory) => {
    productStore.selectedCategory = newCategory;
    productStore.getProductPaginate();
  });
  
  </script>
  