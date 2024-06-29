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
import type { Product } from '@/types/product.type';
import { useCustomerStore } from '@/stores/customer.store';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const promotionStore = usePromotionStore();
const toppingStore = useToppingStore();
const userStore = useUserStore();
const selectedCategory = ref('');
const productFilters = ref<Product[]>();
const searchQuery = ref('');
const customerStore = useCustomerStore();
onMounted(async () => {
  promotionStore.promotions = []
  await productStore.getAllProducts();
  await categoryStore.getAllCategories();
  await toppingStore.getAllToppings();
  await customerStore.getAllCustomers();
  console.log("cate__", categoryStore.categoriesForCreate)
  if (userStore.currentUser?.userRole === "พนักงานขายข้าว") {
    promotionStore.getPromotionByType("ร้านกับข้าว");
    selectedCategory.value = "กับข้าว";
    const cate = categoryStore.categoriesForCreate.find(category => category.categoryName === "กับข้าว")
    categoryStore.categoriesForCreate = [];
    categoryStore.categoriesForCreate.push(cate!);
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLocaleLowerCase() === "กับข้าว".toLocaleLowerCase());
  } else {
    promotionStore.getPromotionByType("ร้านกาแฟ");
    selectedCategory.value = "กาแฟ";
    const cate = categoryStore.categoriesForCreate.findIndex(category => category.categoryName === "กับข้าว")
    categoryStore.categoriesForCreate.splice(cate, 1);
console.log("cate",  categoryStore.categoriesForCreate)
   productFilters.value = productStore.products.filter(product => product.category.categoryName.toLocaleLowerCase() === "กาแฟ".toLocaleLowerCase());
console.log("Filter", productFilters.value)
  }
});
watch(selectedCategory, async (newCategory) => {
  if (newCategory) {
    productFilters.value = [];
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLocaleLowerCase() === newCategory.toLocaleLowerCase());
  }
});

watch(searchQuery, async (newQuery) => {
  if (newQuery === '') {
    productFilters.value = [];
    if (userStore.currentUser?.userRole === "พนักงานขายข้าว") {
      productFilters.value = productStore.products.filter(product => product.category.categoryName.toLocaleLowerCase() === selectedCategory.value.toLocaleLowerCase() && product.category.categoryName.toLocaleLowerCase() === 'กับข้าว'.toLocaleLowerCase());
    } else {
      productFilters.value = productStore.products.filter(product => product.category.categoryName.toLocaleLowerCase() === selectedCategory.value.toLocaleLowerCase() && product.category.categoryName.toLocaleLowerCase() !== 'กับข้าว'.toLocaleLowerCase());
    }
  } else {
    productFilters.value = [];
    if (userStore.currentUser?.userRole === "พนักงานขายข้าว") {
      productFilters.value = productStore.products.filter(product => product.productName.toLocaleLowerCase().includes(newQuery.toLocaleLowerCase()) && product.category.categoryName.toLocaleLowerCase() === 'กับข้าว'.toLocaleLowerCase());
    } else {
      productFilters.value = productStore.products.filter(product => product.productName.toLocaleLowerCase().includes(newQuery.toLocaleLowerCase()) && product.category.categoryName.toLocaleLowerCase() !== 'กับข้าว'.toLocaleLowerCase());
    }
  }
});


</script>


<template>
  <v-app style="width: 100vw; height: 100vh;">
    <v-row class="full-width-row" style="height: 100%;">


      <v-col cols="7" class="d-flex flex-column align-center" style="background-color: #C1B6A9; height: 100%;">
        <v-container fluid class="full-width-container" style="height: 100%;">
          <v-row class="full-width-row">
            <v-col cols="12" class="d-flex justify-center align-center ">
              <promotion-cards-carousel></promotion-cards-carousel>
            </v-col>
          </v-row>
          <v-row class="full-width-row">
            <v-col cols="12" md="6">
              <v-text-field v-model="searchQuery" append-icon="mdi-magnify" label="ค้นหา" variant="solo" single-line hide-details></v-text-field>
            </v-col>
          </v-row>
          <v-row class="full-width-row">
            <v-col cols="12" md="6">
              <v-tabs v-model="selectedCategory" align-tabs="start" color="brown">
                <v-tab v-for="category in categoryStore.categoriesForCreate" :key="category.categoryId" :value="category.categoryName">
                  {{ category.categoryName }}
                </v-tab>
              </v-tabs>
            </v-col>
          </v-row>
          <v-row class="full-width-row" style="flex: 1; overflow-y: auto;">
            <v-tabs-items v-model="selectedCategory" style="width: 100%;">
              <v-tab-item>
                <v-container fluid class="full-width-container">
                  <v-row class="full-width-row">
                    <v-col v-for="product in productFilters" :key="product.productId" cols="12" sm="6" md="4" lg="3" class="d-flex">
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
      <v-col cols="5" class="d-flex flex-column" style="margin: 0; padding: 10px; height: 100%;">
        <v-sheet style="height: 100%; display: flex; flex-direction: column;">
          <selected-items-list style="flex: 1;"></selected-items-list>
        </v-sheet>
      </v-col>
    </v-row>
    <receipt-dialog />
  </v-app>
</template>

<style scoped>
.full-width-container,
.full-width-row {
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
