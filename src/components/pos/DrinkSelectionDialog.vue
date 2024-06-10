<template>
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span>{{ product.productName }}</span>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-subtitle>{{ product.productPrice }} $</v-card-subtitle>
        <v-card-text>
          <v-img :src="product.productImage" class="mb-4"></v-img>
  
          <div>
            <span>ตัวเลือก</span>
            <v-btn v-for="type in productTypes" :key="type.productTypeId" :class="{'active': selectedType === type}" @click="selectType(type)">
              {{ type.productTypeName }} {{ type.productTypePrice }}
            </v-btn>
          </div>
  
          <div>
            <span>ระดับความหวาน</span>
            <v-btn v-for="level in sweetnessLevels" :key="level" :class="{'active': selectedSweetness === level}" @click="selectSweetness(level)">
              {{ level }}%
            </v-btn>
          </div>
  
          <div>
            <span>ท็อปปิ้ง</span>
            <div class="topping-container">
              <v-btn icon @click="prevTopping">mdi-chevron-left</v-btn>
              <v-btn v-for="topping in displayedToppings" :key="topping.productTypeToppingId" :class="{'active': selectedToppings.includes(topping)}" @click="toggleTopping(topping)">
                {{ topping.productTypeToppingName }} {{ topping.productTypeToppingPrice }}
              </v-btn>
              <v-btn icon @click="nextTopping">mdi-chevron-right</v-btn>
            </div>
          </div>
  
          <div class="quantity-container">
            <v-btn icon @click="decreaseQuantity">mdi-minus</v-btn>
            <span>{{ quantity }}</span>
            <v-btn icon @click="increaseQuantity">mdi-plus</v-btn>
          </div>
        </v-card-text>
  
        <v-card-actions>
          <v-btn color="primary" @click="confirmSelection">ยืนยันการทำรายการ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { usePosStore } from '@/stores/pos.store';
  import { useProductStore } from '@/stores/product.store';
  
  const posStore = usePosStore();
  const productStore = useProductStore();
  
  const showDialog = ref(false);
  
  const product = computed(() => posStore.selectProduct);
  
  const quantity = ref(1);
  const selectedType = ref(null);
  const selectedSweetness = ref(null);
  const selectedToppings = ref([]);
  const currentToppingIndex = ref(0);
  
  const productTypes = computed(() => product.value?.productTypes || []);
  
  const sweetnessLevels = ref([0, 25, 50, 100, 125]);
  
  const toppings = ref([
    { productTypeToppingId: 1, productTypeToppingName: '+10 บุก', productTypeToppingPrice: 10 },
    { productTypeToppingId: 2, productTypeToppingName: '+20 น้ำผึ้ง', productTypeToppingPrice: 20 },
    { productTypeToppingId: 3, productTypeToppingName: '+20 ไข่มุก', productTypeToppingPrice: 20 },
    // Add more toppings as needed
  ]);
  
  const displayedToppings = computed(() => {
    return toppings.value.slice(currentToppingIndex.value, currentToppingIndex.value + 3);
  });
  
  function closeDialog() {
    showDialog.value = false;
    productStore.selectProduct(null);
  }
  
  function selectType(type) {
    selectedType.value = type;
  }
  
  function selectSweetness(level) {
    selectedSweetness.value = level;
  }
  
  function toggleTopping(topping) {
    if (selectedToppings.value.includes(topping)) {
      selectedToppings.value = selectedToppings.value.filter(t => t !== topping);
    } else {
      selectedToppings.value.push(topping);
    }
  }
  
  function prevTopping() {
    if (currentToppingIndex.value > 0) {
      currentToppingIndex.value -= 1;
    }
  }
  
  function nextTopping() {
    if (currentToppingIndex.value < toppings.value.length - 3) {
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
    posStore.addToCart(product.value, {
      type: selectedType.value,
      sweetness: selectedSweetness.value,
      toppings: selectedToppings.value,
      quantity: quantity.value
    });
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
    background-color: #f5f5f5; /* Adjust the color to match your design */
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
  </style>
  