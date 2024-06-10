<template>
    <v-app>
      <v-container>
        <promotion-cards-carousel></promotion-cards-carousel>
        <search-bar></search-bar>
        <category-tabs></category-tabs>
        <v-row>
          <v-col v-for="product in filteredProducts" :key="product.productId" cols="12" md="4">
            <product-card :product="product"></product-card>
          </v-col>
        </v-row>
        <selected-items-list></selected-items-list>
        <drink-selection-dialog></drink-selection-dialog>
      </v-container>
    </v-app>
  </template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import PromotionCardsCarousel from '@/components/pos/PromotionCardsCarousel.vue';
import SearchBar from '@/components/pos/SearchBar.vue';
import CategoryTabs from '@/components/pos/CategoryTabs.vue';
import ProductCard from '@/components/pos/ProductCard.vue';
import SelectedItemsList from '@/components/pos/SelectedItemsList.vue';
import DrinkSelectionDialog from '@/components/pos/DrinkSelectionDialog.vue';
import { useProductStore } from '@/stores/product.store';
import { useCategoryStore } from '@/stores/category.store';
import { usePromotionStore } from '@/stores/promotion.store';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const promotionStore = usePromotionStore();

const filteredProducts = computed(() => {
    return productStore.products.filter(product => {
        const matchesCategory = productStore.selectedCategory ? product.category.categoryName === productStore.selectedCategory : true;
        const matchesSearch = productStore.searchQuery ? product.productName.toLowerCase().includes(productStore.searchQuery.toLowerCase()) : true;
        return matchesCategory && matchesSearch;
    });
});

onMounted(async () => {
    await productStore.getAllProducts();
    await categoryStore.getAllCategories(); 
    await promotionStore.getAllPromotions();
});
</script>

<style scoped>
.v-container {
    background-color: #faf4ee;
    /* Match the background color */
}
</style>