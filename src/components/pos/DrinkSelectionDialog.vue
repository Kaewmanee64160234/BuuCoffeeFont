<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import type { Topping } from '@/types/topping.type';
import type { ProductType } from '@/types/productType.type';
import { useProductStore } from '@/stores/product.store';
import { useToppingStore } from '@/stores/topping.store';
import type { ProductTypeTopping } from '@/types/productTypeTopping.type';

const posStore = usePosStore();
const productStore = useProductStore();
const toppingStore = useToppingStore();

const showDialog = ref(false);

const quantity = ref(1);
const selectedType = ref<ProductType | null>(null);
const selectedSweetness = ref<number | null>(null);
const selectedToppings = ref<Topping[]>([]);
const currentToppingIndex = ref(0);

const sweetnessLevels = ref([0, 25, 50, 100, 125]);

const displayedToppings = computed(() => {
  return toppingStore.toppings.slice(currentToppingIndex.value, currentToppingIndex.value + 3);
});

function closeDialog() {
  showDialog.value = false;
  productStore.setSelectedProduct(null);
  productStore.toppingDailog = false;
  // clear data
  selectedType.value = null;
  selectedSweetness.value = null;
  selectedToppings.value = [];
  currentToppingIndex.value = 0;
  quantity.value = 1;
}

function selectType(type: ProductType) {
  selectedType.value = type;
}

function selectSweetness(level: number) {
  selectedSweetness.value = level;
}

function addTopping(topping: Topping) {
  const existingTopping = selectedToppings.value.find(t => t.toppingId === topping.toppingId);
  if (!existingTopping) {
    selectedToppings.value.push({ ...topping, quantity: 1 });
  }
}

function increaseToppingQuantity(topping: Topping) {
  const selectedTopping = selectedToppings.value.find(t => t.toppingId === topping.toppingId);
  if (selectedTopping) {
    selectedTopping.quantity += 1;
  }
}

function decreaseToppingQuantity(topping: Topping) {
  const selectedTopping = selectedToppings.value.find(t => t.toppingId === topping.toppingId);
  if (selectedTopping && selectedTopping.quantity > 1) {
    selectedTopping.quantity -= 1;
  }
}

function prevTopping() {
  if (currentToppingIndex.value > 0) {
    currentToppingIndex.value -= 1;
  }
}

function nextTopping() {
  if (currentToppingIndex.value < toppingStore.toppings.length - 3) {
    currentToppingIndex.value += 1;
  }
}

function increaseQuantity() {
  quantity.value += 1;
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
}

function confirmSelection() {
  if (!selectedType.value) return;

  const productTypeTopping: ProductTypeTopping = {
    productType: selectedType.value,
    topping: selectedToppings.value.length > 0 ? selectedToppings.value[0] : null, // Example for one topping
    quantity: quantity.value,
  };
console.log('productTypeTopping', productTypeTopping);
  posStore.addToCart(productStore.selectedProduct, productTypeTopping);
  closeDialog();
}

watch(() => productStore.selectedProduct, (newVal) => {
  if (newVal && newVal.category.haveTopping) {
    showDialog.value = true;
  } else {
    showDialog.value = false;
  }
});
</script>

<template>
  <v-dialog v-model="productStore.toppingDailog" max-width="600">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span>{{ productStore.selectedProduct?.productName }}</span>
        </div>
        <v-btn icon @click="closeDialog">
          <v-icon color="red">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle class="d-flex justify-space-between align-center">
        <div>{{ productStore.selectedProduct?.productName }}</div>
        <div>{{ productStore.selectedProduct?.productPrice }} $</div>
      </v-card-subtitle>
      <v-card-text>
        <v-img :src="productStore.selectedProduct?.productImage" class="mb-4"></v-img>
        <div class="d-flex flex-column">
          <span>ตัวเลือก</span>
          <div class="d-flex justify-space-between">
            <v-chip
              v-for="type in productStore.selectedProduct?.productTypes"
              :key="type.productTypeId"
              variant="outlined"
              :color="selectedType === type ? '#f5a623' : 'gray'"
              @click="selectType(type)"
            >
              {{ type.productTypeName }} {{ type.productTypePrice }}
            </v-chip>
          </div>
        </div>
        <div class="d-flex flex-column">
          <span>ระดับความหวาน</span>
          <div class="d-flex justify-space-between">
            <v-chip
              v-for="level in sweetnessLevels"
              :key="level"
              variant="outlined"
              :color="selectedSweetness === level ? '#f5a623' : 'gray'"
              @click="selectSweetness(level)"
            >
              {{ level }}%
            </v-chip>
          </div>
        </div>
        <div class="d-flex flex-column">
          <span>ท็อปปิ้ง</span>
          <div class="topping-container d-flex align-center">
            <v-btn icon @click="prevTopping">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <div class="d-flex justify-space-between flex-grow-1">
              <div v-for="topping in displayedToppings" :key="topping.toppingId" class="topping-item d-flex flex-column align-center">
                <v-chip
                  variant="outlined"
                  :color="selectedToppings.some(t => t.toppingId === topping.toppingId) ? '#f5a623' : 'gray'"
                  @click="addTopping(topping)"
                >
                  {{ topping.toppingName }} {{ topping.toppingPrice }}
                </v-chip>
                <div v-if="selectedToppings.some(t => t.toppingId === topping.toppingId)" class="quantity-controls d-flex align-center mt-2">
                  <v-btn icon @click="decreaseToppingQuantity(topping)">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <span>{{ selectedToppings.find(t => t.toppingId === topping.toppingId)?.quantity }}</span>
                  <v-btn icon @click="increaseToppingQuantity(topping)">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
            <v-btn icon @click="nextTopping">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="quantity-container d-flex justify-space-between align-center mt-4">
          <v-btn @click="decreaseQuantity" icon="mdi-minus"></v-btn>
          <span>{{ quantity }}</span>
          <v-btn @click="increaseQuantity" icon="mdi-plus"></v-btn>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="confirmSelection">ยืนยันการทำรายการ</v-btn>
      </v-card-actions>
      {{ posStore.selectedItems }}
    </v-card>
  </v-dialog>
</template>

<style scoped>
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

.justify-center {
  justify-content: center;
}

.active {
  background-color: #f5a623;
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
