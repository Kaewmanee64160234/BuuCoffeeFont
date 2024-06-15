<template>
  <v-dialog v-model="posStore.toppingDialog" max-width="600">
    <v-card v-if="productStore.selectedProduct">
      <v-card-title class="d-flex justify-space-between align-center">
        <div></div>
        <v-btn icon @click="closeDialog">
          <v-icon color="red">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-alert v-if="showAlert" type="error" dismissible @input="showAlert = false">
        Please select a product type before confirming.
      </v-alert>
      <v-card-text>
        <v-row>
          <v-col class="d-flex justify-center align-center" style="width: 200px; height: 200px;">
            <v-img :src="`http://localhost:3000/products/${productStore.selectedProduct.productId}/image`"
              class="product-image"></v-img>
          </v-col>
          <v-col>
            <v-row>
              <v-col>
                <span class="product-name">{{ productStore.selectedProduct.productName }}</span>
              </v-col>
              <v-col>
                <span class="product-price">{{ productStore.selectedProduct.productPrice }} ฿</span>
              </v-col>
            </v-row>
            <v-row class="mt-3">
              <div class="d-flex flex-column">
                <span>ตัวเลือก</span>
                <div class="d-flex flex-wrap">
                  <v-chip v-for="type in productStore.selectedProduct.productTypes" :key="type.productTypeId"
                    variant="outlined" :color="selectedType === type ? '#f5a623' : 'gray'" @click="selectType(type)"
                    class="chip">
                    {{ type.productTypeName }} {{ type.productTypePrice }}
                  </v-chip>
                </div>
              </div>
            </v-row>
          </v-col>
        </v-row>
        <div class="product-info-container d-flex">
          <div class="product-options-container">
            <div class="d-flex flex-column mt-4">
              <span>ระดับความหวาน</span>
              <div class="d-flex justify-start">
                <v-chip v-for="level in sweetnessLevels" :key="level" variant="outlined"
                  :color="selectedSweetness === level ? '#f5a623' : 'gray'" @click="selectSweetness(level)"
                  class="chip">
                  {{ level }}%
                </v-chip>
              </div>
            </div>
            <div class="d-flex flex-column mt-4">
              <span>ท็อปปิ้ง</span>
              <div class="topping-container d-flex align-center">
                <v-btn size="x-small" icon @click="prevTopping">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div class="d-flex justify-space-between flex-grow-1 ma-3">
                  <div v-for="topping in displayedToppings" :key="topping.toppingId"
                    class="topping-item d-flex flex-column align-center">
                    <v-chip variant="outlined"
                      :color="selectedToppings.some(t => t.topping.toppingId === topping.toppingId) ? '#f5a623' : 'gray'"
                      @click="toggleTopping(topping)" class="chip">
                      {{ topping.toppingName }} {{ topping.toppingPrice }}
                    </v-chip>
                    <div v-if="selectedToppings.some(t => t.topping.toppingId === topping.toppingId)"
                      class="quantity-controls d-flex align-center mt-2">
                      <v-btn size="small" icon @click="decreaseToppingQuantity(topping)">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                      <span>{{ selectedToppings.find(t => t.topping.toppingId === topping.toppingId)?.quantity }}</span>
                      <v-btn size="small" icon @click="increaseToppingQuantity(topping)">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
                <v-btn size="x-small" icon @click="nextTopping">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>

          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-row class="justify-center align-center w-100">
          <v-col class="d-flex justify-center align-center">
            <div class="quantity-container d-flex justify-space-between align-center">
              <v-btn variant="elevated" color="#C5C5C5" click="decreaseQuantity" icon="mdi-minus"></v-btn>
              <span class="mx-2">{{ quantity }}</span>
              <v-btn variant="elevated" color="#FF9642" @click="increaseQuantity" icon="mdi-plus"></v-btn>
            </div>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <v-btn variant="elevated" color="#FF9642" rounded="xl" style="width: 90%;" @click="confirmSelection">ยืนยันการทำรายการ</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import { useToppingStore } from '@/stores/topping.store';
import type { ProductType } from '@/types/productType.type';
import type { Topping } from '@/types/topping.type';
import type { ProductTypeTopping } from '@/types/productTypeTopping.type';
import { ref, computed, watch } from 'vue';
import Swal from 'sweetalert2';

const posStore = usePosStore();
const productStore = useProductStore();
const toppingStore = useToppingStore();
const selectedType = ref<ProductType | null>(null);
const selectedSweetness = ref<number>(100);
const selectedToppings = ref<Array<{ topping: Topping; quantity: number }>>([]);
const quantity = ref<number>(1);
const toppingIndex = ref<number>(0);
const productTypeToppings = ref<ProductTypeTopping[]>([]);
const showAlert = ref<boolean>(false);

const sweetnessLevels = [0, 25, 50, 75, 100];
const displayedToppings = computed(() => {
  return toppingStore.toppings.slice(toppingIndex.value, toppingIndex.value + 5);
});

function selectType(type: ProductType) {
  selectedType.value = type;
  showAlert.value = false;
}

function selectSweetness(level: number) {
  selectedSweetness.value = level;
}

function toggleTopping(topping: Topping) {
  const index = selectedToppings.value.findIndex((t) => t.topping.toppingId === topping.toppingId);
  if (index === -1) {
    selectedToppings.value.push({ topping, quantity: 1 });
  } else {
    selectedToppings.value.splice(index, 1);
  }
}

function increaseToppingQuantity(topping: Topping) {
  const toppingItem = selectedToppings.value.find((t) => t.topping.toppingId === topping.toppingId);
  if (toppingItem) {
    toppingItem.quantity++;
  }
}

function decreaseToppingQuantity(topping: Topping) {
  const toppingItem = selectedToppings.value.find((t) => t.topping.toppingId === topping.toppingId);
  if (toppingItem && toppingItem.quantity > 1) {
    toppingItem.quantity--;
  }
}

function prevTopping() {
  if (toppingIndex.value > 0) {
    toppingIndex.value--;
  }
}

function nextTopping() {
  if (toppingIndex.value < toppingStore.toppings.length - 5) {
    toppingIndex.value++;
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function increaseQuantity() {
  quantity.value++;
}

function closeDialog() {
  posStore.toppingDialog = false;

  clearData();
}

function confirmSelection() {
  if (!selectedType.value) {
    showAlert.value = true;
    return;
  }

  for (var i = 0; i < selectedToppings.value.length; i++) {
    productTypeToppings.value.push({
      productTypeToppingId: 0,
      productType: selectedType.value,
      topping: selectedToppings.value[i].topping,
      quantity: selectedToppings.value[i].quantity,
    });
  }

  posStore.addToReceipt(
    productStore.selectedProduct!,
    selectedType.value,
    productTypeToppings.value,
    quantity.value,
    selectedSweetness.value
  );
  closeDialog();
}

// clear data
function clearData() {
  selectedType.value = null;
  selectedSweetness.value = 0;
  selectedToppings.value = [];
  quantity.value = 1;
  toppingIndex.value = 0;
  productStore.selectedProduct = null;
  productTypeToppings.value = [];
}

// Watch for changes in posStore.toppingDialog and ensure selectedProduct is set
watch(
  () => posStore.toppingDialog,
  (newVal) => {
    if (newVal && !productStore.selectedProduct) {
      console.warn("Topping dialog opened without selected product.");
      posStore.toppingDialog = false; // Close the dialog if no product is selected
    }
  }
);
</script>

<style scoped>
.product-info-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.product-image {
  width: 150px;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
}

.product-options-container {
  flex-grow: 1;
}

.product-name {
  font-size: 20px;
  font-weight: bold;
}

.product-price {
  font-size: 20px;
  color: #f5a623;
  font-weight: bold;
}

.promotion-container {
  display: flex;
  justify-content: space-around;
}

.promotion-card {
  width: 200px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 10px;
}

.text-center {
  text-align: center;
}



.active {
  background-color: #f5a623;
}

.chip {
  margin: 5px;
}

.topping-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-container span {
  margin: 0 10px;
  font-size: 20px;
}

.topping-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-controls span {
  margin: 0 10px;
}
</style>
