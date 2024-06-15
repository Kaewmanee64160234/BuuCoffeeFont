<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import { useCustomerStore } from '@/stores/customer.store';
import Swal from 'sweetalert2';
import AddCustomerDialog from '../customer/AddCustomerDialog.vue';
import FindCustomerDialog from '../pos/FindCustomerDialog.vue';
import type { ReceiptItem } from '../../types/receipt.type';

const step = ref(1);
const posStore = usePosStore();
const customerStore = useCustomerStore();
const selectedItems = computed(() => posStore.selectedItems);
const selectedCustomer = ref('');

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

watch(() => selectedCustomer.value, () => {
  if (selectedCustomer.value === '' || selectedCustomer.value === null) {
    posStore.receipt.customer = null;
    return;
  }

  findCustomer();
}
);

function findCustomer() {
  console.log('Selected customer:', selectedCustomer.value);
  const customer = customerStore.customers.find(c => c.customerPhone === selectedCustomer.value);
  console.log('Customer found:', customer);

  if (customer) {
    posStore.receipt.customer = customer;
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Customer Not Found',
      text: 'No customer found with this phone number.',
    });
  }
}
</script>

<template>
  <v-app style="width: 100%; padding: 20px;">
    <v-window v-model="step" transition="fade">
      <v-window-item :value="1">
        <div>
          <h3>รายละเอียดการสั่งซื้อ</h3>
          <h6>สมาชิก: <span>{{ posStore.receipt.customer?.customerName == null ? 'ไม่มี' : posStore.receipt.customer?.customerName }}</span></h6>
          <h6>แต้มสะสม: <span>{{ posStore.receipt.customer == null ? '0' : posStore.receipt.customer?.customerNumberOfStamp }}</span> Point</h6>
          <h6>เบอร์โทรลูกค้า</h6>
          <div class="py-2">
            <v-row class="d-flex justify-center align-center">
              <v-col cols="12" md="6">
                <v-autocomplete v-model="selectedCustomer" :items="customerStore.customers.map(c => c.customerPhone)" item-text="phone" item-value="phone" label="เบอร์โทรลูกค้า" variant="solo" append-inner-icon="mdi-magnify"></v-autocomplete>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn icon="mdi-account-plus" color="#ff9800" @click="openCreateCustomerDialog()"></v-btn>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn color="#ff9800" @click="openCreateCustomerDialog()">ประวัติการสั่งซื้อ</v-btn>
              </v-col>
            </v-row>
          </div>
          <v-divider></v-divider>
          <div class="selected-items-list" style="width: 100%;">
            <v-divider></v-divider>
            <div style="width: 100%;">
              <v-row style="width: 100%;">
                <v-col cols="12" md="6"></v-col>
                <v-col cols="12" md="6">
                  <v-btn color="red" variant="text">ยกเลิกรายการ</v-btn>
                </v-col>
              </v-row>
              <v-row style="width: 100%;">
                <v-list class="full-width">
                  <v-list-item-group>
                    <div v-for="(item, index) in selectedItems" :key="index" class="selected-item full-width">
                      <v-list-item :prepend-avatar="`http://localhost:3000/products/${item.product?.productId}/image`">
                        <v-row>
                          <v-col cols="8">
                            <div>{{ item.product?.productName }}</div>
                          </v-col>
                          <v-col cols="4" class="text-right">
                            <v-list-item-subtitle>{{ item.receiptSubTotal.toFixed(2) }}</v-list-item-subtitle>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="8">
                            <div>{{ item.productType?.productTypeName }} - ความหวาน {{ item.sweetnessLevel }}%</div>
                            <div v-if="item.productTypeToppings.length > 0">
                              <span>ท็อปปิ้ง:</span>
                              <ul>
                                <li v-for="topping in item.productTypeToppings" :key="topping.topping.toppingId">
                                  {{ topping.topping.toppingName }}: {{ topping.topping.toppingPrice }}
                                </li>
                              </ul>
                            </div>
                          </v-col>
                          <v-col cols="4" class="text-right">
                            <v-btn size="xs-small" icon @click="decreaseQuantity(index)">
                              <v-icon>mdi-minus</v-icon>
                            </v-btn>
                            <span class="pa-2">{{ item.quantity }}</span>
                            <v-btn size="xs-small" icon @click="increaseQuantity(item)">
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
              </v-row>
            </div>
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
          </div>
          <AddCustomerDialog />
          <FindCustomerDialog v-model:dialog="customerStore.openDialogFindCustomer" />
          <v-btn color="primary" @click="nextStep">ถัดไป</v-btn>
        </div>
      </v-window-item>
      <v-window-item :value="2">
        <div>
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
            <v-btn color="secondary" @click="prevStep">ย้อนกลับ</v-btn>
          </v-card-actions>
        </div>
      </v-window-item>
    </v-window>
  </v-app>
</template>

<style scoped>
.selected-item {
  display: flex;
  align-items: center;

}

.quantity-controls {
  display: flex;
  align-items: center;
}

.full-width {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.v-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
