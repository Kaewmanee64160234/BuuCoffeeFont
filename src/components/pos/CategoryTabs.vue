<template>
  <v-tabs v-model="selectedCategory" background-color="#f5f5f5">
    <v-tab v-for="category in filteredCategories" :key="category.categoryId">
      {{ category.categoryName }}
    </v-tab>
  </v-tabs>
</template>


<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import { ref, watch, computed } from 'vue';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const selectedCategory = ref('');
const props = defineProps<{ userRole: string }>();
const filteredCategories = computed(() => {
  if (props.userRole === "พนักงานขายข้าว") {
    return categoryStore.categories.filter(category => category.categoryName === "อาหาร");
  }
  return categoryStore.categories;
});


watch(selectedCategory, (newCategory) => {
productStore.selectedCategory = newCategory;
productStore.getProductPaginate();
});
console.log(categoryStore.categories)
</script>