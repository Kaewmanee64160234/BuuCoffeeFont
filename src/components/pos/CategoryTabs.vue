<template>
  <v-tabs v-model="selectedCategory" background-color="#f5f5f5">
    <v-tab  v-for="category in categoryStore.categoriesForCreate" :key="category.categoryId" @click="fetchProducts(category)">
      {{ category.categoryName }}
      </v-tab>
  </v-tabs>
</template>

<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import { ref, watch } from 'vue';
import type { Category } from '@/types/category.type';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const selectedCategory = ref('');


watch(selectedCategory, (newCategory) => {
  if (newCategory && newCategory !== 1) {
    productStore.selectedCategory = newCategory;
    productStore.getProductsByCategory(productStore.selectedCategory);
  }
});

function fetchProducts(category: Category) {
  selectedCategory.value = category.categoryName;
}

</script>

<style scoped>
/* Add any necessary styles here */
</style>
