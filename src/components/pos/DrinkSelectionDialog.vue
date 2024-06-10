<template>
  <v-dialog v-model="posStore.toppingDialog" max-width="600">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span>{{ posStore.selectedProduct?.productName }}</span>
        </div>
        <v-btn icon @click="closeDialog">
          <v-icon color="red">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle class="d-flex justify-space-between align-center">
        <div>{{ posStore.selectedProduct?.productName }}</div>
        <div>{{ posStore.selectedProduct?.productPrice }} $</div>
      </v-card-subtitle>
      <v-card-text>
        <v-img :src="posStore.selectedProduct?.productImage" class="mb-4"></v-img>
        <div class="d-flex flex-column">
          <span>ตัวเลือก</span>
          <div class="d-flex justify-space-between">
            <v-chip
              v-for="type in posStore.selectedProduct?.productTypes"
              :key="type?.productTypeId"
              variant="outlined"
              :color="selectedType === type ? '#f5a623' : 'gray'"
              @click="selectType(type)"
            >
              {{ type?.productTypeName }} {{ type?.productTypePrice }}
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
              <div v-for="topping in displayedToppings" :key="topping?.toppingId" class="topping-item d-flex flex-column align-center">
                <v-chip
                  variant="outlined"
                  :color="selectedToppings.some(t => t.topping.toppingId === topping?.toppingId) ? '#f5a623' : 'gray'"
                  @click="toggleTopping(topping)"
                >
                  {{ topping?.toppingName }} {{ topping?.toppingPrice }}
                </v-chip>
                <div v-if="selectedToppings.some(t => t.topping.toppingId === topping?.toppingId)" class="quantity-controls d-flex align-center mt-2">
                  <v-btn icon @click="decreaseToppingQuantity(topping)">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <span>{{ selectedToppings.find(t => t.topping.toppingId === topping?.toppingId)?.quantity }}</span>
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
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { usePosStore } from '@/stores/pos.store';
import { useToppingStore } from '@/stores/topping.store';
import type { ProductType } from '@/types/productType.type';
import type { Topping } from '@/types/topping.type';
import {  ref, computed } from 'vue';


    const posStore = usePosStore();
    const toppingStore = useToppingStore();
    const selectedType = ref<ProductType | null>(null);
    const selectedSweetness = ref<number>(100);
    const selectedToppings = ref<Array<{ topping: Topping; quantity: number }>>([]);
    const quantity = ref<number>(1);
    const toppingIndex = ref<number>(0);

    const sweetnessLevels = [0, 25, 50, 75, 100];
    const displayedToppings = computed(() => {
      return toppingStore.toppings.slice(toppingIndex.value, toppingIndex.value + 5);
    });

    function selectType(type: ProductType) {
      selectedType.value = type;
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
      clearData();
      posStore.toppingDialog = false;
    }

    function confirmSelection() {
      if (selectedType.value) {
        posStore.addToReceipt(
          selectedType.value,
          selectedToppings.value.map((t) => t.topping),
          quantity.value,
          selectedType.value.productTypePrice
        );
      }
      closeDialog();
    }

    // clear data
    function clearData() {
      selectedType.value = null;
      selectedSweetness.value = null;
      selectedToppings.value = [];
      quantity.value = 1;
      toppingIndex.value = 0;

    }

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
