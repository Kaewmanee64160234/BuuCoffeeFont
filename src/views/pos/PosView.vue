<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import PromotionCardsCarousel from '@/components/pos/PromotionCardsCarousel.vue';
import ProductCard from '@/components/pos/ProductCard.vue';
import SelectedItemsList from '@/components/pos/SelectedItemsList.vue';
import DrinkSelectionDialog from '@/components/pos/DrinkSelectionDialog.vue';
import ReceiptDialog from '@/components/pos/ReceiptDialog.vue';
import { useProductStore } from '@/stores/product.store';
import { useCategoryStore } from '@/stores/category.store';
import { usePromotionStore } from '@/stores/promotion.store';
import { useToppingStore } from '@/stores/topping.store';
import { useUserStore } from '@/stores/user.store';
import { useCustomerStore } from '@/stores/customer.store';
import { usePosStore } from '@/stores/pos.store';
import type { Product } from '@/types/product.type';
import Swal from 'sweetalert2';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const promotionStore = usePromotionStore();
const toppingStore = useToppingStore();
const userStore = useUserStore();
const customerStore = useCustomerStore();
const posStore = usePosStore();
const selectedCategory = ref('');
const productFilters = ref<Product[]>([]);
const searchQuery = ref('');
const barcode = ref('');

onMounted(async () => {
  promotionStore.promotions = [];
  await productStore.getAllProducts();
  await categoryStore.getAllCategories();
  await toppingStore.getAllToppings();
  await customerStore.getAllCustomers();
  
  if (userStore.currentUser?.userRole === "พนักงานขายข้าว") {
    promotionStore.getPromotionByType("ร้านกับข้าว");
    selectedCategory.value = "กับข้าว";
    const cate = categoryStore.categoriesForCreate.find(category => category.categoryName === "กับข้าว");
    categoryStore.categoriesForCreate = [cate!];
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLowerCase() === "กับข้าว".toLowerCase());
    promotionStore.promotions = promotionStore.promotions.filter(promotion => promotion.promotionForStore === "ร้านข้าว");
  } else {
    promotionStore.getPromotionByType("ร้านกาแฟ");
    selectedCategory.value = "กาแฟ";
    const cateIndex = categoryStore.categoriesForCreate.findIndex(category => category.categoryName === "กับข้าว");
    if (cateIndex !== -1) categoryStore.categoriesForCreate.splice(cateIndex, 1);
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLowerCase() === "กาแฟ".toLowerCase());
    promotionStore.promotions = promotionStore.promotions.filter(promotion => promotion.promotionForStore === "ร้านกาแฟ");
  }
});

watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLowerCase() === newCategory.toLowerCase());
  }
});

watch(searchQuery, (newQuery) => {
  if (newQuery === '') {
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLowerCase() === selectedCategory.value.toLowerCase());
  } else {
    productFilters.value = productStore.products.filter(product => product.productName.toLowerCase().includes(newQuery.toLowerCase()) && product.category.categoryName.toLowerCase() === selectedCategory.value.toLowerCase());
  }
});

const toggleNavigationDrawer = () => {
  posStore.toggleNavigation();
};

const marginLeft = computed(() => {
  return posStore.hideNavigation ? '0' : '3%';
});

const handleBarcodeInput = async () => {
  if (barcode.value) {
    const foundProduct = productStore.products.find(product => product.barcode === barcode.value);
    if (foundProduct) {
      productStore.selectedProduct = foundProduct; // Set the selected product
      if (foundProduct.category.haveTopping) {
        posStore.selectedProduct = foundProduct;
        posStore.toppingDialog = true;
      } else {
        addToCart(foundProduct);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบสินค้า',
        text: 'ไม่พบสินค้าที่มีบาร์โค้ดนี้',
      });
    }
    barcode.value = '';
  }
};

const addToCart = (product: Product) => {
  if (product.category.haveTopping==false) {
    posStore.addToReceipt(product, null, [], 1, null);

  } 
};
</script>

<template>
  <v-app style="width: 100vw; height: 100vh;">
    <v-row class="full-width-row" style="height: 100%;" :style="{ marginLeft: marginLeft }">
      <v-col cols="7" class="d-flex flex-column align-center" style="background-color: #C1B6A9; height: 100%;">
        <v-container fluid class="full-width-container" style="height: 100%;">
          <v-row class="full-width-row">
            <v-col cols="12" class="d-flex justify-center align-center">
              <promotion-cards-carousel></promotion-cards-carousel>
            </v-col>
          </v-row>
          <v-row class="full-width-row">
            <!-- <v-col cols="12" md="6">
              <v-text-field v-model="searchQuery" append-icon="mdi-magnify" label="ค้นหา" variant="solo" single-line hide-details></v-text-field>
            </v-col> -->
            <v-col cols="12" md="6">
              <v-text-field v-model="barcode" append-icon="mdi-barcode" label="สแกนบาร์โค้ด" variant="solo" single-line hide-details @change="handleBarcodeInput"></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end align-center">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on" @click="toggleNavigationDrawer">
                    <v-icon>{{ posStore.hideNavigation ? 'mdi-fullscreen' : 'mdi-fullscreen-exit' }}</v-icon>
                  </v-btn>
                </template>
                <span>{{ posStore.hideNavigation ? 'Full Screen' : 'Exit Full Screen' }}</span>
              </v-tooltip>
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
