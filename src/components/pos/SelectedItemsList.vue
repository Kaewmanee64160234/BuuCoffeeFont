<template>
  <v-app style="width: 100%;">
    <v-stepper v-model="step" :items="items" style="width: 100%;">
      <template v-slot:item.1>
        <h3 class="text-h6">เลือกสินค้าและลูกค้า</h3>
        <br>
        <v-card class="selected-items-list">
          <v-card-title>รายการที่เลือก</v-card-title>
          <v-divider></v-divider>
          <v-btn color="success" @click="openFindCustomerDialog()">ค้นหาลูกค้า</v-btn>
          <v-btn color="success" @click="openCreateCustomerDialog()">ลงทะเบียนลูกค้า</v-btn>
          <v-divider></v-divider>

          <v-list>
            <v-list-item v-for="(item, index) in selectedItems" :key="index" class="selected-item">
              <v-list-item-avatar>
                <v-img :src="item.product?.productImage" alt="product image"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ item.product?.productName }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.productType?.productTypeName }}</v-list-item-subtitle>
                <div v-if="item.productTypeToppings.length > 0">
                  <v-list-item-subtitle>ท็อปปิ้ง:</v-list-item-subtitle>
                  <v-list-item-subtitle v-for="topping in item.productTypeToppings" :key="topping.topping.toppingId">
                    - {{ topping.topping.toppingName }}: {{ topping.topping.toppingPrice }}
                  </v-list-item-subtitle>
                </div>
              </v-list-item-content>
              <v-list-item-content class="quantity-controls">
                <v-btn icon @click="decreaseQuantity(index)">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span>{{ item.quantity }}</span>
                <v-btn icon @click="increaseQuantity(item)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-list-item-content>
              <v-list-item-content>
                <v-list-item-subtitle>{{ item.receiptSubTotal.toFixed(2) }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click="removeItem(index)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-subtitle>รวมทั้งหมด: {{ posStore.receipt.receiptTotalPrice }}</v-card-subtitle>
          <v-card-subtitle>ราคาลด: {{ posStore.receipt.receiptTotalDiscount }}</v-card-subtitle>
          <v-card-subtitle>โปรโมชั่น:
            <li v-for="promotion in posStore.receipt.receiptPromotions" :key="promotion.receiptPromotionId">
              {{ promotion.promotion.promotionType }}: {{ promotion.discount }}
            </li>
          </v-card-subtitle>
          <v-card-subtitle>รวมสุทธิ: {{ posStore.receipt.receiptNetPrice }}</v-card-subtitle>
          <v-card-subtitle>ลูกค้า: {{ posStore.receipt.customer?.customerName }}</v-card-subtitle>
          <v-divider></v-divider>
        </v-card>
        <AddCustomerDialog />
        <FindCustomerDialog v-model:dialog="customerStore.openDialogFindCustomer" />
      </template>

      <template v-slot:item.2>
        <h3 class="text-h6">เลือกวิธีชำระเงิน</h3>
        <br>
        <v-card>
          <v-card-title>เลือกวิธีชำระเงิน</v-card-title>
          <v-divider></v-divider>
          <v-btn color="success" @click="selectPaymentMethod('cash')">ชำระเงินสด</v-btn>
          <v-btn color="primary" @click="selectPaymentMethod('qrcode')">ชำระด้วย QR Code</v-btn>
          <v-divider></v-divider>
          <v-card-subtitle>รวมทั้งหมด: {{ posStore.receipt.receiptTotalPrice }}</v-card-subtitle>
          <v-card-subtitle>ราคาลด: {{ posStore.receipt.receiptTotalDiscount }}</v-card-subtitle>
          <v-card-subtitle>โปรโมชั่น:
            <li v-for="promotion in posStore.receipt.receiptPromotions" :key="promotion.receiptPromotionId">
              {{ promotion.promotion.promotionType }}: {{ promotion.discount }}
            </li>
          </v-card-subtitle>
          <v-card-subtitle>รวมสุทธิ: {{ posStore.receipt.receiptNetPrice }}</v-card-subtitle>
          <v-card-subtitle>ลูกค้า: {{ posStore.receipt.customer?.customerName }}</v-card-subtitle>
          <v-divider></v-divider>
        </v-card>
        <v-card-actions>
          <v-btn color="primary" @click="save">บันทึก</v-btn>
          <!-- <v-btn color="secondary" @click="prevStep">ย้อนกลับ</v-btn> -->
        </v-card-actions>
      </template>

    </v-stepper>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import { useCustomerStore } from '@/stores/customer.store';
import Swal from 'sweetalert2';
import AddCustomerDialog from '../customer/AddCustomerDialog.vue';
import FindCustomerDialog from '../pos/FindCustomerDialog.vue';
import type { ReceiptItem } from '../../types/receipt.type';

const step = ref(1);
const items = ['เลือกสินค้าและลูกค้า', 'เลือกวิธีชำระเงิน'];
const posStore = usePosStore();
const customerStore = useCustomerStore();
const selectedItems = computed(() => posStore.selectedItems);

function nextStep() {
  step.value++;
}

function prevStep() {
  step.value--;
}

function removeItem(index: number) {
  posStore.removeItem(index);
}

function increaseQuantity(item: ReceiptItem) {
  console.log('increase quantity', item);
  if (item.product?.category.haveTopping) {
    if (item.productTypeToppings.length > 0) {
      posStore.addToReceipt(item.product, item.productType, item.productTypeToppings, 1, item.sweetnessLevel);
    } else {
      posStore.addToReceipt(item.product, item.productType, [], 1, item.sweetnessLevel);
    }
  } else {
    posStore.addToReceipt(item.product, {}, [], 1, null);
  }
}

function decreaseQuantity(index: number) {
  const item = selectedItems.value[index];
  if (item.quantity === 1) {
    removeItem(index);
  } else {
    posStore.spliceData(index);
  }
}

function selectPaymentMethod(method: string) {
  console.log(`Selected payment method: ${method}`);
  posStore.receipt.paymentMethod = method;
}

function save() {
  // Perform validation
  if (selectedItems.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Data',
      text: 'Please add at least one item to the receipt.',
    });
    return;
  }
  if (posStore.receipt.paymentMethod === '') {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Data',
      text: 'Please select payment method.',
    });
    return;
  }

  posStore.createReceipt();
  // Clear data
  posStore.selectedItems = [];
  posStore.receipt.receiptTotalPrice = 0;
  posStore.receipt.receiptTotalDiscount = 0;
  posStore.receipt.receiptNetPrice = 0;
  posStore.receipt.receiptPromotions = [];
  posStore.receiptDialog = true;
}

function openCreateCustomerDialog() {
  customerStore.openDialogRegisterCustomer = true;
}

function openFindCustomerDialog() {
  customerStore.openDialogFindCustomer = true;
}
</script>

<style scoped>
.selected-items-list {
  background-color: #f5f5f5;
  border-radius: 10px;
}

.selected-item {
  display: flex;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
}
</style>
