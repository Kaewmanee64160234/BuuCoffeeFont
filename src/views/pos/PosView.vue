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
import type { Recipe } from '@/types/recipe.type';

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

// Load products, categories, promotions, and customers on mount
onMounted(async () => {
  promotionStore.promotions = [];
  if (userStore.currentUser?.userRole === "พนักงานขายข้าว") {
    await productStore.getProductByStoreType("ร้านข้าว");
  } else if (userStore.currentUser?.userRole === "พนักงานขายกาแฟ") {
    await productStore.getProductByStoreType("ร้านกาแฟ");
  } else {
    await productStore.getAllProducts();
  }

  await categoryStore.getAllCategories();
  await toppingStore.getAllToppings();
  await customerStore.getAllCustomers();

  userStore.getCurrentUser();

  if (userStore.currentUser?.userRole === "พนักงานขายข้าว") {
    promotionStore.getPromotionByType("ร้านข้าว");
    selectedCategory.value = "กับข้าว";

    // Filter categories to show only "กับข้าว"
    categoryStore.categoriesForCreate = categoryStore.categoriesForCreate.filter(
      category => category.categoryName === "กับข้าว"
    );

    // Filter products to show only those without toppings and in the "กับข้าว" category
    productFilters.value = productStore.products.filter(
      product => product.category.categoryName === "กับข้าว" && !product.category.haveTopping
    );

    // Filter promotions to show only those for "ร้านข้าว"
    promotionStore.promotions = promotionStore.promotions.filter(
      promotion => promotion.promotionForStore === "ร้านข้าว"
    );
  }
  else if (userStore.currentUser?.userRole === "พนักงานขายกาแฟ") {
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

  // Load queue list from local storage
  loadQueueListFromLocalStorage();
  loadFullscreenStateFromLocalStorage();

});

// Load queue list from local storage
const loadQueueListFromLocalStorage = () => {
  const storedQueueList = localStorage.getItem('queueReceipt');
  console.log(storedQueueList);

  if (storedQueueList) {
    posStore.queueReceipt = JSON.parse(storedQueueList);
  } else {
    posStore.queueReceipt = []; // Initialize if not found
    posStore.saveQueueListToLocalStorage(); // Save initial empty list
  }
};
const loadFullscreenStateFromLocalStorage = () => {
  const storedFullscreenState = localStorage.getItem('fullscreenState');
  if (storedFullscreenState !== null) {
    posStore.hideNavigation = JSON.parse(storedFullscreenState);
  }
};

const saveFullscreenStateToLocalStorage = () => {
  localStorage.setItem('fullscreenState', JSON.stringify(posStore.hideNavigation));
};



// Remove an item from the queue
const removeFromQueue = (index: number) => {
  posStore.queueReceipt.splice(index, 1);
  posStore.saveQueueListToLocalStorage(); // Save updated list to local storage
};

// Watchers for selectedCategory and searchQuery
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

// Toggles the hideNavigation property in the posStore
const toggleNavigationDrawer = () => {
  posStore.toggleNavigation();
  saveFullscreenStateToLocalStorage();
};

// Handles barcode input for searching products
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

// Adds a product to the cart
const addToCart = (product: Product) => {
  if (product.category.haveTopping === false) {
    posStore.addToReceipt(product, null, [], 1, null);
  }
};

// Select a receipt to view its details
const selectReceipt = (receipt: Recipe) => {
  posStore.currentReceipt = receipt;
  posStore.receiptDialog = true;
};

// Computed property to determine margin based on navigation state
const marginLeft = computed(() => {
  return posStore.hideNavigation ? '0' : '3%';
});

// Computed property to determine the column size for the main interface
const mainInterfaceCols = computed(() => {
  return posStore.hideNavigation ? 5 : 7; // Adjust the column size based on hideNavigation state
});

// Computed property to determine if the queue column should be shown
const showQueue = computed(() => {
  return posStore.hideNavigation; // Show the queue only when hideNavigation is true
});

</script>


<template>
  <v-app style="width: 100vw; height: 100vh; overflow: hidden;">
    <v-row :style="{ height: '100%' }">
      <!-- Left Column (Queue) -->
      <v-col cols="2" class="queue-column" style="padding: 0;" v-if="showQueue">
        <v-container fluid class="queue-container" style="height: 100vh; overflow-y: auto; padding: 0;">
          <h2 class="pa-2 ml-3 mt-2">Queue</h2>
          <v-row class="fill-height" no-gutters>
              <v-col v-if="posStore.queueReceipt.length > 0" cols="12">
                  <v-card v-for="(receipt, index) in posStore.queueReceipt" :key="index" class="queue-card"
                          @click="selectReceipt(receipt!)" elevation="3" style="margin-bottom: 8px;">
                      <v-card-title class="d-flex" style="fit-content; position: relative; padding-left: 8px;">
                          <div class="queue-title" style="display: flex; flex-direction: column; align-items: flex-start; width: 100%;">
                              <span class="queue-info" style="font-size: 1em; width: 100%;">
                                  คิวที่{{ index + 1 }}
                                  <span class="customer-name" style="font-size: 0.8em;">
                                      {{ receipt.customer?.customerName || 'ลูกค้าทั่วไป' }}
                                  </span>
                              </span>
      
                              <!-- Product List -->
                              <div v-if="receipt.products && receipt.products.length > 0" style="margin-top: 4px;">
                                  <span v-for="(item, itemIndex) in receipt.products" :key="itemIndex" style="font-size: 0.8em;">
                                      {{ item.productName }} - {{ item.quantity }} ชิ้น
                                  </span>
                              </div>
      
                              <!-- Total Price -->
                              <span class="total-price" style="font-size: 0.8em; font-weight: bold; margin-top: 4px;">
                                  ราคารวมสุทธิ: {{ receipt.receiptTotalPrice }} บาท
                              </span>
                          </div>
                          <v-btn icon @click.stop="removeFromQueue(index)" class="delete-button" style="position: absolute; top: 1px; right: 1px; border-radius: 50%; width: 36px; height: 36px; background-color: white;">
                              <v-icon color="red" style="font-size: 24px;">mdi-delete</v-icon>
                          </v-btn>
                      </v-card-title>
      
                      <v-card-subtitle class="queue-details" style="font-size: 0.75em; padding-left: 8px;">
                          คลิกเพื่อดูรายละเอียดเพิ่มเติม
                      </v-card-subtitle>
                  </v-card>
              </v-col>
      
              <v-col v-else cols="12">
                  <v-card class="queue-card" elevation="3">
                      <v-card-title class="text-center">ไม่มีคิว</v-card-title>
                  </v-card>
              </v-col>
          </v-row>
      </v-container>
      
      
      </v-col>


      <!-- Main Interface Column -->
      <v-col :cols="mainInterfaceCols" class="d-flex flex-column align-center  "
        style="background-color: #f7f7f7; height: 100%; overflow: hidden;">
        <v-container fluid class="full-width-container " style="height: 100%; overflow: hidden; margin-left: 6%;">
          <!-- Promotion Carousel and Dialogs -->
          <v-row class="full-width-row" style="overflow: hidden;">
            <v-col cols="12" class="d-flex justify-center align-center" style="overflow: hidden;">
              <promotion-cards-carousel></promotion-cards-carousel>
              <PromotionUsePointDialog />
            </v-col>
          </v-row>

          <!-- Barcode Input and Fullscreen Button -->
          <v-row class="full-width-row" style="overflow: hidden; margin-bottom: 10px;">
            <v-col cols="12" md="6">
              <v-text-field v-model="barcode" append-icon="mdi-barcode" label="สแกนบาร์โค้ด" variant="solo" dense
                hide-details @change="handleBarcodeInput"
                style="background-color: #f1f1f1; border-radius: 8px;"></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end align-center">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on" @click="toggleNavigationDrawer"
                    style="background-color: #fff; border-radius: 50%; margin-left: 10px;">
                    <v-icon>{{ posStore.hideNavigation ? 'mdi-fullscreen' : 'mdi-fullscreen-exit' }}</v-icon>
                  </v-btn>
                </template>
                <span>{{ posStore.hideNavigation ? 'Full Screen' : 'Exit Full Screen' }}</span>
              </v-tooltip>
            </v-col>
          </v-row>

          <!-- Category Tabs -->
          <v-row class="full-width-row " style="overflow: hidden; margin-bottom: 10px;">
            <v-col cols="12" >
              <v-tabs v-model="selectedCategory" align-tabs="start" color="brown" class="full-width-tabs"
                background-color="#fff">
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
                <v-container fluid class="full-width-container" style="margin-left: 20px;"   >
                  <v-row class="full-width-row">
                    <!-- Adjusted column size to 6 for 2 columns per row -->
                    <v-col v-for="product in productFilters" :key="product.productId" cols="12" sm="6" md="6" lg="6"
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
      <v-col cols="5" class="d-flex flex-column" style="height: 100%; padding-top: 20px;">
        <v-sheet style="height: 100%;">
          <selected-items-list></selected-items-list>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Receipt Dialog -->
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

.full-width-tabs {
  width: 100%;
}

.product-list-container {
  height: calc(100vh - 250px);
  /* Adjust based on the height of other elements */
  overflow-y: auto;
  scrollbar-width: thin;
  /* Firefox */
  scrollbar-color: #888 #f1f1f1;
  /* Customize scrollbar colors */
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
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  background-color: #fff;
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

.queue-column {
  width: 100%;
  max-width: 240px;
  /* Maximum width for queue column */
  transition: all 0.3s ease;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.queue-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.queue-container::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 6px;
}

.queue-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.queue-card {
  width: 90%;
  /* Ensures all queue cards have the same width */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  margin-left: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.queue-card:hover {
  background-color: #f6f6f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.queue-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.queue-number {
  font-size: 16px;
}

.customer-name {
  font-size: 14px;
  color: #666;
}

.queue-details {
  color: #888;
  font-size: 12px;
  margin-top: 5px;
}

.delete-button {
  transition: background-color 0.3s, transform 0.3s;
}

.delete-button:hover {
  background-color: #ffebeb;
  transform: rotate(20deg);
  color: #ff5252;
}

/* Add scrollbar styles */
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

/* Firefox */
.product-list-container {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
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