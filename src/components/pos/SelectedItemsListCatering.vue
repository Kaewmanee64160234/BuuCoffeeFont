<script lang="ts" setup>

import { ref, computed, watch, onMounted } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import Swal from 'sweetalert2';
import type { ReceiptItem } from '../../types/receipt.type';
import { useReceiptStore } from '@/stores/receipt.store';
import { useIngredientStore } from '@/stores/Ingredient.store'; // Assuming you have an ingredient store
import ReceiptDetailsDialogPos from '../receipts/ReceiptDialogPos.vue';

const step = ref(1);
const posStore = usePosStore();
const selectedItems = computed(() => posStore.selectedItems);
const receiptStore = useReceiptStore();
const ingredientStore = useIngredientStore(); // Assuming this is the correct import for ingredients
const selectedCategory = ref('Products');
const ingredientFilters = ref<any[]>([]); // To store filtered ingredients
const url = import.meta.env.VITE_URL_PORT

onMounted(async () => {
  await receiptStore.getRecieptCateringIn24Hours();
  await ingredientStore.getAllIngredients(); // Load all ingredients (assuming this method exists)

  // Filter ingredients or products based on selectedCategory
  watch(selectedCategory, (newCategory) => {
    if (newCategory === 'Products') {
      ingredientFilters.value = posStore.selectedItems;
    } else if (newCategory === 'Ingredients') {
      ingredientFilters.value = ingredientStore.all_ingredients; // Assuming ingredients are stored here
    }
  });
});

function nextStep() {
  if (selectedItems.value.length === 0 && ingredientStore.ingredientCheckList.length === 0) {
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

  posStore.receipt.change = posStore.receipt.receive - posStore.receipt.receiptNetPrice;

}

watch(() => posStore.receipt.receive, () => {
  console.log('Receive:', posStore.receipt.receive);
  console.log('Change:', posStore.receipt.change);


  calculateChange();
});

function increaseQuantity(item: ReceiptItem) {
  posStore.addToReceipt(item.product!, item.productType!, item.productTypeToppings, 1, item.sweetnessLevel);
}

function decreaseQuantity(index: number) {
  const item = selectedItems.value[index];
  if (item.quantity === 1) {
    removeItem(index);
  } else {
    posStore.spliceData(index);
  }
}

// Functions for ingredient list
function increaseIngredientQuantity(index: number) {
  ingredientStore.ingredientCheckList[index].count++;
}

function decreaseIngredientQuantity(index: number) {
  if (ingredientStore.ingredientCheckList[index].count === 1) {
    removeIngredient(index);
  } else {
    ingredientStore.ingredientCheckList[index].count--;
  }
}

function removeIngredient(index: number) {
  ingredientStore.ingredientCheckList.splice(index, 1);
}

const saveCheckData = async () => {
  ingredientStore.selectedAction = 'export';

  try {
    await ingredientStore.saveCheckData();
  } catch (error) {
    console.error('Error saving check data:', error);

    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลของคุณ.',
      icon: 'error',
    });
  }
};

async function save() {
  posStore.receipt.paymentMethod = 'cash';

  // Check if there are products in the selectedItems list or ingredients in the ingredientCheckList
  if (selectedItems.value.length > 0 || ingredientStore.ingredientCheckList.length > 0) {
    // Ensure payment method is selected
    if (posStore.receipt.paymentMethod === '') {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่สมบูรณ์',
        text: 'กรุณาเลือกวิธีการชำระเงิน',
      });
      return;
    }

    // Ensure received amount is sufficient for cash payments
    if (posStore.receipt.paymentMethod === 'cash' && posStore.receipt.receive < posStore.receipt.receiptNetPrice && posStore.receipt.receive != 0) {
      Swal.fire({
        icon: 'error',
        title: 'จำนวนเงินไม่เพียงพอ',
        text: 'กรุณาตรวจสอบจำนวนเงินที่รับมา',
      });
      return;
    }

    let receiptCreated = false;
    let stockChecked = false;

    if (posStore.receipt.receiptId) {
      await posStore.updateReceiptCatering(posStore.receipt.receiptId, posStore.receipt);
      receiptCreated = true;
    } else {
        await saveCheckData();
        console.log('Check data saved', ingredientStore.checkIngerdient);
        await posStore.createReceiptForCatering(ingredientStore.checkIngerdient?.CheckID!);

    }

    // Clear the selected items and reset receipt details
    posStore.selectedItems = [];
    posStore.receipt.receiptTotalPrice = 0;
    posStore.receipt.receiptTotalDiscount = 0;
    posStore.receipt.receiptNetPrice = 0;
    posStore.receipt.receiptPromotions = [];
    ingredientStore.ingredientCheckList = [];
    posStore.receipt.receive = 0;
    posStore.receipt.change = 0;
    step.value = 1;
    posStore.receipt.paymentMethod = '';
    posStore.receipt.customer = null;
    posStore.receipt.receiptId = null;
    posStore.receipt.receiptStatus = 'รอชำระเงิน';

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'การตรวจสอบสต็อกวัตถุดิบเสร็จสิ้น',
      });
    
  } else {
    // If neither products nor ingredients are selected, show an error
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่สมบูรณ์',
      text: 'กรุณาเพิ่มสินค้าหรือวัตถุดิบอย่างน้อยหนึ่งรายการ',
    });
  }
}

function openReceiptDialog() {
  posStore.ReceiptDialogPos = true;
  console.log("openReceiptDialog", posStore.ReceiptDialogPos);
}
</script>



<template>
  <ReceiptDetailsDialogPos />


  <div class="h-screen app">

    <v-window v-model="step" transition="fade" class="h-screen">
      <!-- Order Details View -->
      <v-window-item :value="1" class="full-height">
        <div class="content-container">
          <div class="header">
            <div class="d-flex justify-space-between align-center">
              <h3>รายละเอียดการจัดเลี้ยงรับรอง</h3>
            </div>
            <v-row class="d-flex align-center justify-start mt-4">


              <v-btn class="mb-2" color="#ff9800" @click="openReceiptDialog()"
                style="border-radius: 8px; background-color: #FF9642;">
                ประวัติการสั่งซื้อ
              </v-btn>

            </v-row>

            <v-divider class="my-2"></v-divider>

            <!-- Product Summary -->
            <h3>สรุปรายการสินค้า</h3>
            <div class="selected-items-list">
              <v-list class="full-width">
                <v-list-item-group>
                  <div v-for="(item, index) in selectedItems" :key="index" class="selected-item my-2">
                    <v-list-item :prepend-avatar="`${url}/products/${item.product?.productId}/image`"
                      class="full-width">
                      <v-row no-gutters class="align-center">
                        <v-col cols="5" class="product-name">
                          {{ item.product?.productName }}
                        </v-col>
                        <v-col cols="2" class="text-right pr-2" style="color: black;">
                          <p>{{ item.receiptSubTotal }}</p>
                        </v-col>
                        <v-col cols="3" class="text-right pr-2">
                          <v-btn size="xs-small" color="#C5C5C5" icon @click="decreaseQuantity(index)">
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                          <span class="pa-2">{{ item.quantity }}</span>
                          <v-btn size="xs-small" color="#FF9642" icon @click="increaseQuantity(item)">
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="2" class="text-right">
                          <v-btn icon variant="text" @click="removeItem(index)">
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row no-gutters v-if="item.product?.category.haveTopping">
                        <v-col cols="12" class="product-details">
                          {{ item.productType?.productTypeName }} +{{ item.productType?.productTypePrice }} | ความหวาน
                          {{ item.sweetnessLevel }}%
                        </v-col>
                        <v-col cols="12" v-if="item.productTypeToppings && item.productTypeToppings.length > 0">
                          <ul class="toppings-list">
                            <li v-for="topping in item.productTypeToppings" :key="topping?.topping?.toppingId"
                              class="topping-item">
                              x{{ topping?.quantity }} {{ topping?.topping?.toppingName }}
                              <span v-if="topping?.topping?.toppingName && topping.topping.toppingName.length > 3">:
                                {{ topping?.topping?.toppingPrice }}.-</span>
                            </li>
                          </ul>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </v-list-item-group>
              </v-list>
            </div>

            <v-divider></v-divider>

            <!-- Ingredient Summary -->
            <h3 class="mt-4">สรุปรายการวัตถุดิบ</h3>
            <div class="ingredient-list">
              <v-list class="full-width">
                <v-list-item-group>
                  <div v-for="(ingredient, index) in ingredientStore.ingredientCheckList" :key="index"
                    class="selected-item my-2">
                    <v-list-item :prepend-avatar="`${url}/ingredients/${ingredient.ingredientcheck.ingredientId}/image`"
                      class="full-width">

                      <v-row no-gutters class="align-center">
                        <v-col cols="5" class="product-name">
                          {{ ingredient.ingredientcheck.ingredientName }}
                          <span
                            v-if="ingredient.ingredientcheck.ingredientSupplier !== '-' && ingredient.ingredientcheck.ingredientSupplier !== ''">
                            ({{ ingredient.ingredientcheck.ingredientSupplier }})
                          </span>
                        </v-col>

                        <v-col cols="2" class="text-right pr-2" style="color: black;">
                          <p>{{ ingredient.ingredientcheck.ingredientPrice }}</p>
                        </v-col>
                        <v-col cols="3" class="text-right pr-2">
                          <v-btn size="xs-small" color="#C5C5C5" icon @click="decreaseIngredientQuantity(index)">
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                          <span class="pa-2">{{ ingredient.count }}</span>
                          <v-btn size="xs-small" color="#FF9642" icon @click="increaseIngredientQuantity(index)">
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="2" class="text-right">
                          <v-btn icon variant="text" @click="removeIngredient(index)">
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-btn>
                        </v-col>

                      </v-row>

                    </v-list-item>
                  </div>
                </v-list-item-group>
              </v-list>
            </div>


            <!-- Order Summary -->
            <div class="summary-section" style="width: 100%;">
              <v-divider></v-divider>


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
            <div class="summary-section">
              <div class="ma-2">
                <!-- Total Amount -->
                <p class="d-flex justify-space-between pr-6 my-2">
                  <span>ทั้งหมด:</span>
                  <span class="info-value">{{ posStore.receipt.receiptTotalPrice.toFixed(2) }}</span>
                </p>

                <div>
                  <p class="d-flex justify-space-between align-center pr-6 my-2">
                    <span style="width: 50%;">จำนวนที่ทำการเบิก:</span>
                    <v-text-field v-model="posStore.receipt.receive" type="number" variant="solo" label="จำนวนเงิน"
                      style="width: 50%;"></v-text-field>
                  </p>
                </div>

                <!-- Change Amount -->
                <p class="d-flex justify-space-between pr-6 my-2">
                  <span>ทอน:</span>
                  <span
                    :class="posStore.receipt.receive < 0 || posStore.receipt.receive < posStore.receipt.receiptNetPrice ? 'red--text' : 'black'"
                    class="info-value">
                    {{ parseFloat(posStore.receipt.change.toFixed(2)) < 0 ? 'จำนวนเงินไม่พอ' :
                      posStore.receipt.change.toFixed(2) }} </span>
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
                <v-btn style="width: 40%; margin-right: 10px;" color="secondary" rounded
                  @click="prevStep">ย้อนกลับ</v-btn>
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

.selected-items-list,
.ingredient-list {
  overflow-y: auto;
  height: 30vh;
  margin-bottom: 20px;
}

.promotion-section {
  overflow-y: auto;
  max-height: 20vh;
  margin-bottom: 20px;
  padding-right: 15px;
}

.promotion-item {
  text-align: end;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.summary-section {
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

  .selected-items-list,
  .ingredient-list {
    max-height: 30%;
  }

  .promotion-section {
    max-height: 15vh;
  }

  .summary-section {
    height: 30%;
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
