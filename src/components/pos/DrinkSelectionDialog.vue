<script setup lang="ts">
import { useCateringStore } from "@/stores/catering.store";
import { usePosStore } from "@/stores/pos.store";
import { useProductStore } from "@/stores/product.store";
import { useToppingStore } from "@/stores/topping.store";
import type { ProductType } from "@/types/productType.type";
import type { Topping } from "@/types/topping.type";
import { ref, computed, watch } from "vue";

const posStore = usePosStore();
const productStore = useProductStore();
const toppingStore = useToppingStore();
const selectedType = ref<ProductType | null>(null);
const selectedSweetness = ref<number>(100);
const selectedToppings = ref<Array<{ topping: Topping; quantity: number }>>([]);
const quantity = ref<number>(1);
const showAlert = ref<boolean>(false);
const cateringStore = useCateringStore();

const sweetnessLevels = [0, 25, 50, 75, 100];

const toppingGroups = computed(() => {
  const groups = [];
  for (let i = 0; i < toppingStore.toppings.length; i += 4) {
    groups.push(toppingStore.toppings.slice(i, i + 4));
  }
  return groups;
});

// Initialize fields when dialog opens
watch(
  () => posStore.toppingDialog,
  (newVal) => {
    if (newVal && cateringStore.selectItemEdit) {
      // Initialize the dialog with selectedItemForEdit values
      const item = cateringStore.selectItemEdit;
      selectedType.value = item.productType || null;
      selectedSweetness.value = item.sweetnessLevel || 100;
      selectedToppings.value = item.productTypeToppings.map((topping) => ({
        topping: topping.topping,
        quantity: topping.quantity,
      }));
      // quantity.value = item.quantity;
    }
  }
);

function selectType(type: ProductType) {
  selectedType.value = type;
  showAlert.value = false;
}

function selectSweetness(level: number) {
  selectedSweetness.value = level;
}

function toggleTopping(topping: Topping) {
  const index = selectedToppings.value.findIndex(
    (t) => t.topping.toppingId === topping.toppingId
  );
  if (index === -1) {
    selectedToppings.value.push({ topping, quantity: 1 });
  } else {
    selectedToppings.value.splice(index, 1);
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

function increaseToppingQuantity(topping: Topping) {
  const toppingItem = selectedToppings.value.find(
    (t) => t.topping.toppingId === topping.toppingId
  );
  if (toppingItem) {
    toppingItem.quantity++;
  }
}

function decreaseToppingQuantity(topping: Topping) {
  const toppingItem = selectedToppings.value.find(
    (t) => t.topping.toppingId === topping.toppingId
  );
  if (toppingItem && toppingItem.quantity > 1) {
    toppingItem.quantity--;
  }
  if (toppingItem && toppingItem.quantity === 1) {
    const index = selectedToppings.value.findIndex(
      (t) => t.topping.toppingId === topping.toppingId
    );
    selectedToppings.value.splice(index, 1);
  }
}

function clearData() {
  selectedType.value = null;
  selectedSweetness.value = 100;
  selectedToppings.value = [];
  quantity.value = 1;
  showAlert.value = false;
}

function confirmSelection() {
  // Check if product type is selected
  if (!selectedType.value) {
    showAlert.value = true;
    return;
  }

  // Check if sweetness level is selected (should always be since default is 100, but to be safe)
  if (
    selectedSweetness.value === null ||
    selectedSweetness.value === undefined
  ) {
    showAlert.value = true;
    return;
  }

  // Update the selectedItemForEdit with the new values
  cateringStore.selectItemEdit!.productType! = selectedType.value;
  cateringStore.selectItemEdit!.sweetnessLevel = selectedSweetness.value;
  cateringStore.selectItemEdit!.productTypeToppings =
    selectedToppings.value.map((t) => ({
      productTypeToppingId: 0, // assuming ID 0 for new toppings
      productType: selectedType.value!,
      topping: t.topping,
      quantity: t.quantity,
    }));
  // cateringStore.selectItemEdit!.quantity = quantity.value;

  // Add to receipt
  cateringStore.addToReceipt(
    cateringStore.selectItemEdit!.product!,
    selectedType.value!,
    cateringStore.selectItemEdit!.productTypeToppings,
    quantity.value,
    selectedSweetness.value
  );


  closeDialog(); // Close the dialog only if the conditions are met
}

function closeDialog() {
  posStore.toppingDialog = false;

  clearData();
}
</script>

<template>
  <v-dialog v-model="posStore.toppingDialog" max-width="650">
    <v-card v-if="cateringStore.selectItemEdit">
      <v-card-title class="d-flex justify-space-between align-center">
        <div></div>
        <v-btn icon @click="closeDialog">
          <v-icon color="red">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-alert
        v-if="showAlert"
        type="error"
        dismissible
        @input="showAlert = false"
      >
        กรุณาเลือกประเภทสินค้า
      </v-alert>
      <v-card-text>
        <v-row>
          <v-col
            class="d-flex justify-center align-center"
            style="width: 200px; height: 200px"
          >
            <img
              :src="`http://localhost:3000/products/${cateringStore.selectItemEdit.product?.productId}/image`"
              class="product-image"
            />
          </v-col>
          <v-col>
            <v-row>
              <v-col>
                <span class="product-name">{{
                  cateringStore.selectItemEdit.product?.productName
                }}</span>
              </v-col>
              <v-col>
                <span class="product-price"></span>
              </v-col>
            </v-row>
            <v-row class="mt-3">
              <div class="d-flex flex-column">
                <span>ตัวเลือก</span>
                <div class="d-flex flex-wrap">
                  <v-chip
                    v-for="type in cateringStore.selectItemEdit!.product!.productTypes"
                    :key="type.productTypeId"
                    @click="selectType(type)"
                    :class="{ 'selected-chip': selectedType === type }"
                    
                    class="chip"
                  >
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
                <v-chip
                  v-for="level in sweetnessLevels"
                  :key="level"
                  variant="outlined"
                  :color="selectedSweetness === level ? '#f5a623' : 'gray'"
                  @click="selectSweetness(level)"
                  class="chip"
                >
                  {{ level }}%
                </v-chip>
              </div>
            </div>
            <div class="d-flex flex-column mt-4">
              <span>ท็อปปิ้ง</span>
              <v-carousel hide-delimiters height="80">
                <v-carousel-item
                  v-for="(toppingGroup, index) in toppingGroups"
                  :key="index"
                >
                  <div class="d-flex justify-center">
                    <div
                      v-for="topping in toppingGroup"
                      :key="topping.toppingId"
                      class="topping-item d-flex flex-column align-center mx-4"
                    >
                      <v-chip
                        variant="outlined"
                        :color="
                          selectedToppings.some(
                            (t) => t.topping.toppingId === topping.toppingId
                          )
                            ? '#f5a623'
                            : 'gray'
                        "
                        @click="toggleTopping(topping)"
                        class="chip"
                      >
                        {{ topping.toppingName }} {{ topping.toppingPrice }}
                      </v-chip>
                      <div
                        v-if="
                          selectedToppings.some(
                            (t) => t.topping.toppingId === topping.toppingId
                          )
                        "
                        class="quantity-controls d-flex align-center mt-2"
                      >
                        <v-btn
                          size="xs-small"
                          icon
                          @click="decreaseToppingQuantity(topping)"
                        >
                          <v-icon size="small">mdi-minus</v-icon>
                        </v-btn>
                        <span>{{
                          selectedToppings.find(
                            (t) => t.topping.toppingId === topping.toppingId
                          )?.quantity
                        }}</span>
                        <v-btn
                          size="xs-small"
                          icon
                          @click="increaseToppingQuantity(topping)"
                        >
                          <v-icon size="small">mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-carousel-item>
              </v-carousel>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-row class="justify-center align-center w-100">
          <v-col class="d-flex justify-center align-center">
            <div
              class="quantity-container d-flex justify-space-between align-center"
            >
              <p class="pa-2">จำนวนสินค้า</p>
              <v-btn
                variant="elevated"
                color="#C5C5C5"
                @click="decreaseQuantity()"
                icon="mdi-minus"
              ></v-btn>
              <span class="mx-2">{{ quantity }}</span>
              <v-btn
                variant="elevated"
                color="#FF9642"
                @click="increaseQuantity()"
                icon="mdi-plus"
              ></v-btn>
            </div>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <v-btn
              variant="elevated"
              color="#FF9642"
              rounded="xl"
              style="width: 90%"
              @click="confirmSelection"
            >
              ยืนยันการทำรายการ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.product-info-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.product-image {
  width: 130px;
  height: auto;
  border-radius: 50%;
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

.selected-chip {
  border: 2px solid #FF9642; /* Add a border or any other styling you prefer */
  background-color: #FF9642;
  color: rgb(0, 0, 0);
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
