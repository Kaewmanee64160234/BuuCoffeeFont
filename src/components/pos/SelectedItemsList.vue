<template>
  <v-card class="selected-items-list">
    <v-card-title>รายการที่เลือก</v-card-title>
    <v-divider></v-divider>
    <v-btn color="success"  @click="openFindCustomerDialog()"  >find customer</v-btn>
    <v-btn color="success" @click="openCreateCustomerDialog()">register customer</v-btn>

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
            <v-list-item-subtitle>Toppings:</v-list-item-subtitle>
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
          <v-btn icon @click="increaseQuantity(index)">
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
    <v-card-subtitle>promotion: {{ posStore.receipt.receiptPromotions }}</v-card-subtitle>
    <v-card-subtitle>รวมสุทธิ: {{ posStore.receipt.receiptNetPrice }}</v-card-subtitle>
    <v-card-subtitle>ลูกค้า: {{ posStore.receipt.customer?.customerName }}</v-card-subtitle>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn @click="selectPaymentMethod('cash')" color="success">ชำระเงินสด</v-btn>
      <v-btn @click="selectPaymentMethod('qrcode')" color="primary">ชำระด้วย QR Code</v-btn>
    </v-card-actions>
  </v-card>
  <v-btn color="warning" @click="save">Finish</v-btn>
  <AddCustomerDialog v-model:dialog="customerStore.openCreateCustomerDialog" />
  <FindCustomerDialog v-model:dialog="customerStore.openDialogFindCustomer" />
</template>

<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { useProductStore } from '@/stores/product.store';
import { computed } from 'vue';
import Swal from 'sweetalert2';
import { useCustomerStore } from '@/stores/customer.store';
import AddCustomerDialog from '../customer/AddCustomerDialog.vue';
import FindCustomerDialog from '../pos/FindCustomerDialog.vue';

const posStore = usePosStore();
const selectedItems = computed(() => posStore.selectedItems);
const productStore = useProductStore();
const customerStore = useCustomerStore();
function removeItem(index: number) {
  posStore.removeItem(index);
}

function increaseQuantity(index: number) {
  if (selectedItems.value[index].product?.category.haveTopping) {
    posStore.addToReceipt(
      selectedItems.value[index].product,
      selectedItems.value[index].productTypeToppings[0].productType,
      selectedItems.value[index].productTypeToppings,
      1,
      selectedItems.value[index].sweetnessLevel,
    );
  } else {
    posStore.addToReceipt(
      selectedItems.value[index].product,
      null,
      [],
      1,
      null,
    );
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
  customerStore.openCreateCustomerDialog = true;
}

// open find customer dialog
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
