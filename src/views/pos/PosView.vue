<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import PromotionCardsCarousel from '@/components/pos/PromotionCardsCarousel.vue';
import SearchBar from '@/components/pos/SearchBar.vue';
import ProductCard from '@/components/pos/ProductCard.vue';
import SelectedItemsList from '@/components/pos/SelectedItemsList.vue';
import DrinkSelectionDialog from '@/components/pos/DrinkSelectionDialog.vue';
import ReceiptDialog from '@/components/pos/ReceiptDialog.vue';
import { useProductStore } from '@/stores/product.store';
import { useCategoryStore } from '@/stores/category.store';
import { usePromotionStore } from '@/stores/promotion.store';
import { useToppingStore } from '@/stores/topping.store';
import { useUserStore } from '@/stores/user.store';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const promotionStore = usePromotionStore();
const toppingStore = useToppingStore();
const userStore = useUserStore();
const selectedCategory = ref('');

const filteredProducts = computed(() => {
  
  return productStore.products.filter(product => {
    const matchesCategory = selectedCategory.value ? product.category.categoryName === selectedCategory.value : true;
    const matchesSearch = productStore.searchQuery ? product.productName.toLowerCase().includes(productStore.searchQuery.toLowerCase()) : true;
    return matchesCategory && matchesSearch;
  });
});

watch(selectedCategory, async (newCategory) => {
  if (newCategory) {
    productStore.products = [];
    await productStore.getProductsByCategory(newCategory);
  }
});

onMounted(async () => {
  await productStore.getAllProducts();
  await categoryStore.getAllCategories();
  await toppingStore.getAllToppings();
  if(userStore.userRole === "พนักงานขายข้าว"){
    promotionStore.getPromotionByType("ร้านกับข้าว");
    productStore.selectedCategory = "กับข้าว";
    selectedCategory.value = "กับข้าว";
    const cate = categoryStore.categoriesForCreate.find(category => category.categoryName === "กับข้าว")
    categoryStore.categoriesForCreate = [];
    categoryStore.categoriesForCreate.push(cate!);
  }else{
    promotionStore.getPromotionByType("ร้านกาแฟ");
    productStore.selectedCategory = "coffee";
    selectedCategory.value = "coffee";
    const cate = categoryStore.categoriesForCreate.findIndex(category => category.categoryName === "กับข้าว")
    categoryStore.categoriesForCreate.splice(cate, 1);

  }

});
</script>

<template>
  <v-app style="width: 100vw;">
    <v-row  class="full-width-row">
      <v-col cols="8" class="d-flex flex-column align-center">
        <v-container fluid class="full-width-container" style="background-color: #C1B6A9;">
  
          <v-row  class="full-width-row" >
            <v-col cols="12" class="d-flex justify-center align-center">
              <promotion-cards-carousel></promotion-cards-carousel>
            </v-col>
          </v-row>
          <v-row  class="full-width-row">
            <v-col cols="12" md="6">
              <search-bar></search-bar>
            </v-col>
          </v-row>
          <v-row  class="full-width-row">
            <v-col cols="12" md="6" >
              <v-tabs v-model="selectedCategory" align-tabs="start" color="brown">
                <v-tab v-for="category in categoryStore.categoriesForCreate" :key="category.categoryId" :value="category.categoryName">
                  {{ category.categoryName }}
                </v-tab>
              </v-tabs>
            </v-col>
          </v-row>
          <v-row  class="full-width-row">
            <v-tabs-items  v-model="selectedCategory" style="width: 100%;">
              <v-tab-item>
                <v-container fluid class="full-width-container">
                  <v-row  class="full-width-row">
                    <v-col
                      v-for="product in filteredProducts"
                      :key="product.productId"
                      cols="12"
                      sm="6"
                      md="4"
                      lg="3"
                      class="d-flex "
                    >
                      <product-card :product="product" class="product-card"></product-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-tab-item>
            </v-tabs-items>
          </v-row>
          <drink-selection-dialog></drink-selection-dialog>
        </v-container>
      </v-col>
      <v-col cols="4">
        <v-sheet class="pa-2 ma-2" style="height: 100%;">
          <selected-items-list></selected-items-list>
        </v-sheet>
      </v-col>
    </v-row>
    <receipt-dialog />
  </v-app>
</template>

<style scoped>
.full-width-container, .full-width-row {
  width: 100%;
  margin: 0;
  padding: 0;
}

.product-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin: 10px;
  transition: transform 0.3s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.text-center {
  text-align: center;
}


</style>
