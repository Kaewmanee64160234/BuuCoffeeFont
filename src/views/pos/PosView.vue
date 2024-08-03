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
import PromotionUsePointDialog from '@/components/pos/PromotionUsePointDialog.vue';
import type QueueCardsCarousel from '@/components/pos/QueueCardsCarousel.vue';
import type { Receipt } from '@/types/receipt.type';

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
const receiptsWithRemoveIcon = ref(new Set<number>()); // Keep track of which receipts should show the remove icon
onMounted(async () => {
  promotionStore.promotions = [];
  if (userStore.currentUser?.userRole == "พนักงานขายข้าว") {
    await productStore.getProductByStoreType("ร้านข้าว");
  }
  else if (userStore.currentUser?.userRole == "พนักงานขายกาแฟ") {
    await productStore.getProductByStoreType("ร้านกาแฟ");
  }
  else {
    await productStore.getAllProducts();
  }

  await categoryStore.getAllCategories();
  await toppingStore.getAllToppings();
  await customerStore.getAllCustomers();
  userStore.getCurrentUser();

  if (userStore.currentUser?.userRole == "พนักงานขายข้าว") {
    promotionStore.getPromotionByType("ร้านข้าว");
    selectedCategory.value = "กับข้าว";
    categoryStore.categoriesForCreate = categoryStore.categoriesForCreate.filter(category => !category.haveTopping);
    productFilters.value = productStore.products.filter(product => !product.category.haveTopping);
    promotionStore.promotions = promotionStore.promotions.filter(promotion => promotion.promotionForStore === "ร้านข้าว");
  } else if (userStore.currentUser?.userRole == "พนักงานขายกาแฟ") {
    promotionStore.getPromotionByType("ร้านกาแฟ");
    selectedCategory.value = "กาแฟ";
    const cateIndex = categoryStore.categoriesForCreate.findIndex(category => category.categoryName === "กับข้าว");
    if (cateIndex !== -1) categoryStore.categoriesForCreate.splice(cateIndex, 1);
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLowerCase() === "กาแฟ".toLowerCase());
    promotionStore.promotions = promotionStore.promotions.filter(promotion => promotion.promotionForStore === "ร้านกาแฟ");
  } else {
    promotionStore.getAllPromotions();
    selectedCategory.value = categoryStore.categoriesForCreate[0].categoryName;
    productFilters.value = productStore.products.filter(product => product.category.categoryName.toLowerCase() === selectedCategory.value.toLowerCase());
  }

});
// openReceiptDialog
function openReceiptDialog(receipt: Receipt) {
  posStore.currentReceipt = receipt;
  posStore.receiptDialog = true;
}


function showRemoveIcon(receiptId: number) {
  // Add receiptId to the set to show remove icon
  if (receiptsWithRemoveIcon.value.has(receiptId)) {
    receiptsWithRemoveIcon.value.delete(receiptId);
  } else {
    receiptsWithRemoveIcon.value.add(receiptId);
  }
}

function removeReceipt(receipt: any) {
  const receiptIndex = posStore.queueReceipt.findIndex((r) => r.receiptId === receipt.receiptId);
  if (receiptIndex !== -1) {
    posStore.queueReceipt.splice(receiptIndex, 1); // Removes the receipt from the queue
    Swal.fire('Removed!', 'The receipt has been removed from the queue.', 'success');
    receiptsWithRemoveIcon.value.delete(receipt.receiptId);
  }
}

// Watch for changes in the receipt queue and handle updates
watch(() => posStore.queueReceipt, (newQueue) => {
  console.log('Receipt queue updated:', newQueue);
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
  if (product.category.haveTopping == false) {
    posStore.addToReceipt(product, null, [], 1, null);

  }
};
</script>
<template>
  <v-app style="width: 100vw; height: 100vh; overflow: hidden;">
    <v-row class="full-width-row" :style="{ marginLeft: marginLeft, height: '100%' }">
      <v-col cols="7" class="d-flex flex-column align-center"
        style="background-color: #C1B6A9; height: 100%; overflow: hidden;">
        <v-container fluid class="full-width-container" style="height: 100%; overflow: hidden;">
          <!-- Promotion Carousel -->
          <v-row class="full-width-row" style="overflow: hidden;">
            <v-col cols="12" class="d-flex justify-center align-center" style="overflow: hidden;">
              <promotion-cards-carousel></promotion-cards-carousel>
              <PromotionUsePointDialog />
            </v-col>
          </v-row>

          <!-- Barcode Input and Receipt Tags in Same Row -->
          <v-row class="full-width-row align-center" style="overflow: hidden;">
            <!-- Barcode Input -->
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-text-field v-model="barcode" append-icon="mdi-barcode" label="สแกนบาร์โค้ด" variant="solo" single-line
                hide-details @change="handleBarcodeInput"></v-text-field>
            </v-col>

            <!-- Receipt Queue -->
            <v-col cols="12" md="6" class="d-flex flex-column align-start">
              <!-- Queue Header -->
              <h3 class="queue-header">Queue</h3>

              <!-- Receipt Tags with Horizontal Scroll -->
              <v-row class="receipt-tags" style="overflow-x: auto; max-height: 50px; width: 100%;">
                <v-chip v-for="(receipt, index) in posStore.queueReceipt" :key="index" class="receipt-chip"
                  color="primary" @click="openReceiptDialog(receipt)" @dblclick="showRemoveIcon(receipt.receiptId!)">
                  #{{ receipt.queueNumber }} {{ receipt.customer?.customerName || 'Guest' }}
                  <v-icon class="remove-icon" @click.stop="removeReceipt(receipt)">
                    mdi-close-circle
                  </v-icon>
                </v-chip>
              </v-row>



            </v-col>
          </v-row>

          <!-- Product Tabs -->
          <v-row class="full-width-row" style="overflow: hidden;">
            <v-col cols="12">
              <v-tabs v-model="selectedCategory" align-tabs="start" color="brown" class="full-width-tabs">
                <v-tab v-for="category in categoryStore.categoriesForCreate" :key="category.categoryId"
                  :value="category.categoryName">
                  {{ category.categoryName }}
                </v-tab>
              </v-tabs>
            </v-col>
          </v-row>

          <!-- Product List -->
          <v-row class="full-width-row product-list-container" style="flex: 1; overflow-y: auto;">
            <v-tabs-items v-model="selectedCategory" style="width: 100%;">
              <v-tab-item>
                <v-container fluid class="full-width-container">
                  <v-row class="full-width-row">
                    <v-col v-for="product in productFilters" :key="product.productId" cols="12" sm="6" md="4" lg="3"
                      class="d-flex">
                      <product-card :product="product" class="product-card"></product-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-tab-item>
            </v-tabs-items>
          </v-row>

          <!-- Drink Selection Dialog -->
          <drink-selection-dialog></drink-selection-dialog>
        </v-container>
      </v-col>

      <!-- Selected Items List -->
      <v-col cols="5" class="d-flex flex-column" style="margin: 0; padding: 10px; height: 100%; overflow: hidden;">
        <v-sheet style="height: 100%; display: flex; flex-direction: column;">
          <selected-items-list style="flex: 1;"></selected-items-list>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Receipt Dialog -->
    <receipt-dialog />
  </v-app>
</template>

<style scoped>
/* Ensure full-width layout for containers and rows */
.full-width-container,
.full-width-row {
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.full-width-tabs {
  width: 100%;
}

/* Flex container for product list with scroll */
.product-list-container {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 250px); /* Adjust based on the height of other elements */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #888 #f1f1f1; /* Customize scrollbar colors */
}

.queue-header {
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 10px;
  color: #444; /* Subtle color for better readability */
}

.receipt-tags {
  margin-top: 10px;
  padding: 0 10px;
  display: flex;
  flex-direction: row; /* Align items in a single row */
  flex-wrap: nowrap; /* Prevent chips from wrapping to a new line */
  gap: 10px;
  max-height: 50px; /* Limit height to a single line */
  overflow-x: auto; /* Enable horizontal scrolling */
  overflow-y: hidden; /* Disable vertical overflow */
  scrollbar-width: thin; /* Firefox scrollbar styling */
  scrollbar-color: #c1b6a9 #e0e0e0;
}

.receipt-tags::-webkit-scrollbar {
  height: 8px; /* Horizontal scrollbar height */
}

.receipt-tags::-webkit-scrollbar-thumb {
  background-color: #c1b6a9;
  border-radius: 10px;
}

.receipt-tags::-webkit-scrollbar-track {
  background-color: #e0e0e0;
}

.receipt-chip {
  font-weight: bold;
  color: white;
  background-color: #3f51b5; /* Primary color for chips */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s ease-in-out;
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 32px;
  border-radius: 16px; /* Ensure round edges */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

.receipt-chip:hover {
  background-color: #ff9800; /* Highlight color on hover */
  transform: translateY(-2px);
}

.remove-icon {
  margin-left: 5px;
  cursor: pointer;
  color: red;
}

.v-btn {
  margin: 5px;
}

/* Product card styling */
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
  background-color: white; /* Consistent background */
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
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

/* Webkit-based browsers (Chrome, Safari) scrollbar styles */
.product-list-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.product-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.product-list-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
  border: 3px solid #f1f1f1;
}

.product-list-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Edge, IE 10+ */
.product-list-container::-ms-scrollbar {
  width: 12px;
  height: 12px;
}

.product-list-container::-ms-scrollbar-track {
  background: #f1f1f1;
}

.product-list-container::-ms-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
  border: 3px solid #f1f1f1;
}

.product-list-container::-ms-scrollbar-thumb:hover {
  background: #555;
}
</style>

