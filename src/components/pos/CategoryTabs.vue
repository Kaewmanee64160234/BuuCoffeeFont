<template>
  <div>
    <v-tabs v-model="selectedCategory" background-color="#f5f5f5">
      <v-tab
        v-for="category in categoryStore.categoriesForCreate"
        :key="category.categoryId"
        @click="fetchProducts(category)"
      >
        {{ category.categoryName }}
      </v-tab>
    </v-tabs>

  
  </div>
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
  if (newCategory) {
    productStore.selectedCategory = newCategory;
    productStore.getProductsByCategory(productStore.selectedCategory);
  }
});

function fetchProducts(category: Category) {
  selectedCategory.value = category.categoryName;
}

function handleAddToCart(product) {
  productStore.setSelectedProduct(product);
  if (product.category.haveTopping) {
    openToppingDialog();
  } else {
    posStore.addToReceipt(product, null, [], 1, 0);
  }
  console.log(product);
}

function openToppingDialog() {
  posStore.toppingDialog = true;
}
</script>

<style scoped>
.product-card {
  background-color: #f5f5f5;
  border-radius: 10px;
  width: 80%;
  padding: 10px;
  cursor: pointer;
}

.text-center {
  text-align: center;
}

.item-img-fd {
  height: 100px !important;
  width: 100px !important;
  object-fit: cover;
  border-radius: 15px;
}

.a-tag-fd .item-card-fd {
  cursor: pointer;
  color: black !important;
  height: 145px;
  width: 300px !important;
}

.a-tag-fd:hover .item-card-fd {
  color: #1f3611 !important;
}

.a-tag:link {
  text-decoration: none;
}
</style>
