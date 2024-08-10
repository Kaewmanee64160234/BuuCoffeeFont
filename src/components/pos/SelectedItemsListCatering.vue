<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import Swal from 'sweetalert2';
import AddCustomerDialog from '../customer/AddCustomerDialog.vue';
import type { Receipt, ReceiptItem } from '../../types/receipt.type';
import { useReceiptStore } from '@/stores/receipt.store';
import ReceiptDetailsDialogPos from '../receipts/ReceiptDialogPos.vue';
import { useIngredientStore } from '@/stores/Ingredient.store'; // Assuming you have an ingredient store

const step = ref(1);
const posStore = usePosStore();
const selectedItems = computed(() => posStore.selectedItems);
const recive = ref(0);
const change = ref(0);
const receiptStore = useReceiptStore();
const ingredientStore = useIngredientStore(); // Assuming this is the correct import for ingredients
const selectedCategory = ref('Products');
const ingredientFilters = ref<any[]>([]); // To store filtered ingredients

onMounted(async () => {
  await receiptStore.getRecieptIn30Min();
  await ingredientStore.getAllIngredients(); // Load all ingredients (assuming this method exists)

  // Filter ingredients or products based on selectedCategory
  watch(selectedCategory, (newCategory) => {
    if (newCategory === 'Products') {
      ingredientFilters.value = posStore.selectedItems;
    } else if (newCategory === 'Ingredients') {
      ingredientFilters.value = ingredientStore.ingredients; // Assuming ingredients are stored here
    }
  });
});

function nextStep() {
  if (selectedItems.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่สมบูรณ์',
      text: 'กรุณาเพิ่มรายการอย่างน้อยหนึ่งรายการในใบเสร็จ',
    });
    return;
  }
  if (posStore.receipt.paymentMethod === '' && step.value === 2) {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่สมบูรณ์',
      text: 'กรุณาเลือกวิธีการชำระเงิน',
    });
    return;
  }
  step.value++;
  console.log('Next Step:', step.value);
}

function prevStep() {
  step.value--;
  console.log('Previous Step:', step.value);
}

function removeItem(index: number) {
  posStore.removeItem(index);
}

function calculateChange() {
  if (posStore.receipt.paymentMethod === 'cash') {
    change.value = recive.value - posStore.receipt.receiptNetPrice;
  }
}

function openReceiptDialog() {
  posStore.ReceiptDialogPos = true;
  console.log(" openReceiptDialog ", posStore.ReceiptDialogPos);
}

function selectPaymentMethod(method: string) {
  console.log(`Selected payment method: ${method}`);
  posStore.receipt.paymentMethod = method;
  if (method === 'cash') {
    calculateChange();
  } else {
    change.value = 0;
  }
}

watch(() => recive.value, () => {
  calculateChange();
});

function increaseQuantity(item: ReceiptItem) {
  posStore.addToReceipt(item.product, item.productType, item.productTypeToppings, 1, item.sweetnessLevel);
}

function decreaseQuantity(index: number) {
  const item = selectedItems.value[index];
  if (item.quantity === 1) {
    removeItem(index);
  } else {
    posStore.spliceData(index);
  }
}

async function save() {
  if (selectedItems.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่สมบูรณ์',
      text: 'กรุณาเพิ่มรายการอย่างน้อยหนึ่งรายการในใบเสร็จ',
    });
    return;
  }
  if (posStore.receipt.paymentMethod === '') {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่สมบูรณ์',
      text: 'กรุณาเลือกวิธีการชำระเงิน',
    });
    return;
  }
  if (posStore.receipt.paymentMethod === 'cash' && recive.value < posStore.receipt.receiptNetPrice) {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่สมบูรณ์',
      text: 'กรุณาป้อนจำนวนเงินสดที่ได้รับที่ถูกต้อง',
    });
    return;
  }
  if (posStore.receipt.receiptId) {
    posStore.updateReceipt(posStore.receipt.receiptId, posStore.receipt);
  } else {
    posStore.createReceipt();
  }
  posStore.selectedItems = [];
  posStore.receipt.receiptTotalPrice = 0;
  posStore.receipt.receiptTotalDiscount = 0;
  posStore.receipt.receiptNetPrice = 0;
  posStore.receipt.receiptPromotions = [];
  posStore.receiptDialog = true;
  recive.value = 0;
  change.value = 0;
  step.value = 1;
  posStore.receipt.paymentMethod = '';
  posStore.receipt.customer = null;
  posStore.receipt.receiptId = null;
  posStore.receipt.receiptStatus = 'รอชำระเงิน';
}
</script>


<template>
  <ReceiptDetailsDialogPos />
  <div class="h-screen app">
    <AddCustomerDialog />

    <v-window v-model="step" transition="fade" class="h-screen">
      <!-- Order Details View -->
      <v-window-item :value="1" class="full-height">
        <div class="content-container">
          <div class="header">
            <div class="d-flex justify-space-between align-center">
              <h3>รายละเอียดการสั่งซื้อ</h3>
            </div>

            <v-divider></v-divider>

            <!-- Product Summary -->
            <h3>สรุปรายการสินค้าในร้าน</h3>
            <div class="selected-items-list-50">
              <v-list class="full-width">
                <v-list-item-group>
                  <div v-for="(item, index) in selectedItems" :key="index" class="selected-item full-width my-2">
                    <v-list-item :prepend-avatar="`http://localhost:3000/products/${item.product?.productId}/image`"
                      class="full-width">
                      <v-row no-gutters>
                        <v-col cols="6" class="product-name" style="color: black;">
                          {{ item.product?.productName }}
                        </v-col>
                        <v-col cols="6" class="text-right pr-8" style="color: black;">
                          <p>{{ item.receiptSubTotal }}</p>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="7" style="color: gray;">
                          <div v-if="item.product?.category.haveTopping" class="product-details">
                            {{ item.productType?.productTypeName }} +{{ item.productType?.productTypePrice }} | ความหวาน
                            {{ item.sweetnessLevel }}%
                          </div>
                          <div v-else>
                            <div class="product-details">
                              {{ item.product?.productName }} ({{ item.product?.category.categoryName }}) {{
                              item.product?.productPrice }}.-
                            </div>
                          </div>
                          <div v-if="item.productTypeToppings && item.productTypeToppings.length > 0">
                            <ul class="toppings-list">
                              <li v-for="topping in item.productTypeToppings" :key="topping?.topping?.toppingId"
                                class="topping-item">
                                x{{ topping?.quantity }} {{ topping?.topping?.toppingName }}
                                <span v-if="topping?.topping?.toppingName && topping.topping.toppingName.length > 3">:
                                  {{ topping?.topping?.toppingPrice }}.-</span>
                              </li>
                            </ul>
                          </div>
                        </v-col>
                        <v-col cols="5">
                          <v-btn size="xs-small" color="#C5C5C5" icon @click="decreaseQuantity(index)">
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                          <span class="pa-2">{{ item.quantity }}</span>
                          <v-btn size="xs-small" color="#FF9642" icon @click="increaseQuantity(item)">
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                          <v-btn icon variant="text" @click="removeItem(index)">
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </v-list-item-group>
              </v-list>
            </div>

            <!-- Ingredient Summary -->
            <h3>สรุปรายการวัตถุดิบ</h3>
            <div class="ingredient-list-50">
              <v-list class="full-width">
                <v-list-item-group>
                  <div v-for="(ingredient, index) in ingredientStore.ingredientList" :key="index"
                    class="selected-item full-width my-2">
                    <v-list-item :prepend-avatar="`http://localhost:3000/ingredients/${ingredient.ingredientId}/image`"
                      class="full-width">
                      <v-row no-gutters>
                        <v-col cols="6" class="product-name" style="color: black;">
                          {{ ingredient.ingredient.ingredientName }}
                        </v-col>
                        <v-col cols="6" class="text-right pr-8" style="color: black;">
                          <p>{{ ingredient.ingredient!.ingredientPrice}}</p>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="12" style="color: gray;">
                          <div class="ingredient-details">
                            {{ ingredient.ingredient.ingredientSupplier }} | {{ ingredient.totalunit }} units
                          </div>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </v-list-item-group>
              </v-list>
            </div>

            <!-- Order Summary -->
            <div class="summary-section-30" style="width: 100%;">
              <v-divider></v-divider>
              <h3>สรุปรายการ</h3>
              <v-card-subtitle>โปรโมชั่น:</v-card-subtitle>
              <div class="promotion-30">
                <div class="sub-promotion">
                  <div v-for="(promotion) in posStore.receipt.receiptPromotions" :key="promotion.receiptPromotionId"
                    style="text-align: end; width: 100%; padding-right: 40px;">
                    <div style="width: 100%;">
                      <span class="pa-2">{{ promotion.promotion.promotionName }}:</span>
                      <span class="red--text">{{ promotion.discount }} $</span>
                      <v-btn size="small" icon variant="text" @click="removePromotion(promotion.promotion)">
                        <v-icon color="red">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
              <v-divider></v-divider>
              <v-row class="py-3">
                <v-col>
                  <h3>ราคาสุทธิ</h3>
                </v-col>
                <v-col style="text-align: end; color: #FF9642;padding-right: 65px;">
                  <h3>{{ posStore.receipt.receiptNetPrice }}</h3>
                </v-col>
              </v-row>
            </div>
          </div>
          <div class="footer-buttons">
            <v-row class="d-flex justify-center" style="width: 100%;">
              <v-btn style="padding-right: 20px; width: 80%;" color="#FF9642" rounded @click="nextStep">
                ชำระเงิน
              </v-btn>
            </v-row>
          </div>
        </div>
      </v-window-item>

      <!-- Payment Method View -->
      <v-window-item :value="2" class="full-height">
        <div class="content-container">
          <div class="title-detail">
            <div class="d-flex justify-space-between align-center">
              <h3>รายละเอียดการสั่งซื้อ</h3>
            </div>

            <v-divider></v-divider>

            <!-- Summary Section -->
            <div class="summary-section-2">
              <div class="ma-2">
                <!-- Total Amount -->
                <p class="d-flex justify-space-between pr-6 my-2">
                  <span>ทั้งหมด:</span>
                  <span class="info-value">{{ posStore.receipt.receiptTotalPrice.toFixed(2) }}</span>
                </p>

                <div>
                  <p class="d-flex justify-space-between align-center pr-6 my-2">
                    <span style="width: 50%;">รับมา:</span>
                    <v-text-field v-model="recive" type="number" variant="solo" label="จำนวนเงิน"
                      style="width: 50%;"></v-text-field>
                  </p>
                </div>

                <!-- Change Amount -->
                <p class="d-flex justify-space-between pr-6 my-2">
                  <span>ทอน:</span>
                  <span :class="recive < 0 || recive < posStore.receipt.receiptNetPrice ? 'red--text' : 'black'"
                    class="info-value">
                    {{ parseFloat(change.toFixed(2)) < 0 ? 'จำนวนเงินไม่พอ' : change.toFixed(2) }} </span>
                </p>

                <v-divider></v-divider>

                <!-- Net Price -->
                <v-row class="pt-4">
                  <v-col>
                    <h3>ราคาสุทธิ</h3>
                  </v-col>
                  <v-col class="text-end" style="color: #FF9642;padding-right: 65px;">
                    <h3>{{ posStore.receipt.receiptNetPrice }}</h3>
                  </v-col>
                </v-row>
              </div>
            </div>

            <div class="footer-buttons">
              <v-row class="d-flex justify-center" style="width: 100%;">
                <v-btn style="width: 40%; margin-right: 10px;" color="secondary" rounded @click="prevStep">ย้อนกลับ</v-btn>
                <v-btn style="width: 40%;" color="#FF9642" rounded @click="save">บันทึก</v-btn>
              </v-row>
            </div>
          </div>
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>


<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.full-height {
  height: 100%;
}

.header {
  margin-bottom: 20px;
}

.selected-item {
  display: flex;
  align-items: center;
}

.full-width {
  width: 100%;
}

.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}

.product-details,
.ingredient-details {
  font-size: 14px;
  color: gray;
  font-weight: lighter;
}

.toppings-list {
  list-style: none;
  padding-left: 0;
  margin-top: 5px;
}

.topping-item {
  font-size: 12px;
  color: gray;
}

.selected-items-list-50,
.ingredient-list-50 {
  overflow-y: auto;
  max-height: 40%;
  margin-bottom: 20px;
}

.promotions-section {
  overflow-y: auto;
  max-height: 40vh;
  margin-bottom: 20px;
  padding-right: 15px;
}

.summary-section-30,
.summary-section-2 {
  height: 30%;
  margin-top: 20px;
  padding: 10px;
  border-radius: 8px;
}

.red--text {
  color: red;
}

.footer-buttons {
  margin-top: auto;
  padding: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .content-container {
    padding: 10px;
  }

  .selected-items-list-50,
  .ingredient-list-50 {
    max-height: 35%;
  }

  .promotions-section {
    max-height: 30vh;
  }

  .summary-section-30,
  .summary-section-2 {
    height: 35%;
  }

  .footer-buttons {
    flex-direction: column;
    align-items: center;
  }

  .footer-buttons>v-btn {
    width: 90%;
    margin-bottom: 10px;
  }
}
</style>
