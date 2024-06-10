<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import type { Topping } from '@/types/topping.type';
import type { ProductType } from '@/types/productType.type';
import { useProductStore } from '@/stores/product.store';
import { useToppingStore } from '@/stores/topping.store';

const posStore = usePosStore();
const productStore = useProductStore();
const toppingStore = useToppingStore();

const showDialog = ref(false);


const quantity = ref(1);
const selectedType = ref(null);
const selectedSweetness = ref(null);
const selectedToppings = ref([]);
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

function selectSweetness(level: string) {
    selectedSweetness.value = level;
}

function toggleTopping(topping: Topping) {
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
    posStore.addToCart(productStore.selectedProduct.value, {
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


<template>
  <v-dialog v-model="productStore.toppingDailog" max-width="600">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="12" md="6">
            <span>{{ productStore.selectedProduct?.productName }}</span>
          </v-col>
          <v-col cols="12" md="6" style="text-align: right;">
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-subtitle>
        {{ productStore.selectedProduct?.productName }} {{ productStore.selectedProduct?.productPrice }} $
      </v-card-subtitle>
      <v-card-text>
        <v-img :src="productStore.selectedProduct?.productImage" class="mb-4"></v-img>
        <div>
          <span>ตัวเลือก</span>
          <v-chip
            variant="outlined"
            v-for="type in productStore.selectedProduct?.productTypes"
            :key="type.productTypeId"
            :class="{ 'active': selectedType === type }"
            @click="selectType(type)"
          >
            {{ type.productTypeName }} {{ type.productTypePrice }}
          </v-chip>
        </div>
        <div>
          <span>ระดับความหวาน</span>
          <v-chip
            variant="outlined"
            v-for="level in sweetnessLevels"
            :key="level"
            :color="{ 'active': selectedSweetness === level }"
            :class="{ 'active': selectedSweetness === level }"
            @click="selectSweetness(level)"
          >
            {{ level }}%
          </v-chip>
        </div>
        <div>
          <span>ท็อปปิ้ง</span>
          <div class="topping-container">
            <v-btn icon="mdi-chevron-left" @click="prevTopping"></v-btn>
            <v-chip
              variant="outlined"
              v-for="topping in displayedToppings"
              :key="topping.toppingId"
              :class="{ 'active': selectedToppings.includes(topping) }"
              @click="toggleTopping(topping)"
            >
              {{ topping.toppingName }} {{ topping.toppingPrice }}
            </v-chip>
            <v-btn icon="mdi-chevron-right" @click="nextTopping"></v-btn>
          </div>
        </div>
        <div class="quantity-container">
          <v-btn @click="decreaseQuantity" icon="mdi-minus"></v-btn>
          <span>{{ quantity }}</span>
          <v-btn @click="increaseQuantity" icon="mdi-plus"></v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="confirmSelection">ยืนยันการทำรายการ</v-btn>
      </v-card-actions>
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
    /* Adjust the color to match your design */
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