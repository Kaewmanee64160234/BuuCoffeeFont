<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePosStore } from '@/stores/pos.store';
import { useCustomerStore } from '@/stores/customer.store';
import Swal from 'sweetalert2';
import AddCustomerDialog from '../customer/AddCustomerDialog.vue';
import FindCustomerDialog from '../pos/FindCustomerDialog.vue';
import type { ReceiptItem } from '../../types/receipt.type';
import type { Promotion } from '../../types/promotion.type';
import { useUserStore } from '@/stores/user.store';

const step = ref(1);
const posStore = usePosStore();
const customerStore = useCustomerStore();
const userStore = useUserStore();
const selectedItems = computed(() => posStore.selectedItems);
const selectedCustomer = ref('');
const recive = ref(0);
const change = ref(0);

function nextStep() {
  if (selectedItems.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Data',
      text: 'Please add at least one item to the receipt.',
    });
    return;
  }
  if (posStore.receipt.paymentMethod === '' && step.value === 2) {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Data',
      text: 'Please select payment method.',
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
  if (posStore.receipt.paymentMethod === 'cash' && recive.value < posStore.receipt.receiptNetPrice) {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Data',
      text: 'Please enter the correct amount of cash received.',
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
  recive.value = 0;
  change.value = 0;
  step.value = 1; // Reset step to 1 after saving
  posStore.receipt.paymentMethod = '';
}

function openCreateCustomerDialog() {
  customerStore.openDialogRegisterCustomer = true;
}

function cancelReceipt() {
  posStore.selectedItems = [];
  posStore.receipt.receiptTotalPrice = 0;
  posStore.receipt.receiptTotalDiscount = 0;
  posStore.receipt.receiptNetPrice = 0;
  posStore.receipt.receiptPromotions = [];
  posStore.receiptDialog = false;
  recive.value = 0;
  change.value = 0;
  step.value = 1; // Reset step to 1 after cancel
  posStore.receipt.paymentMethod = '';


}

function removePromotion(promotion: Promotion) {
  posStore.removePromotion(promotion);
}

watch(() => selectedCustomer.value, () => {
  if (selectedCustomer.value === '' || selectedCustomer.value === null) {
    posStore.receipt.customer = null;
    return;
  }

  findCustomer();
});

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
  <div class="h-screen app">
    <AddCustomerDialog />
    <v-window v-model="step" transition="fade" class="h-screen">
      <v-window-item :value="1" class="full-height">
        <div class="content-container">
          <div>
            <div class="d-flex justify-space-between" style="padding-right: 60px;">
              <h3>รายละเอียดการสั่งซื้อ</h3>
              <h3>#{{ posStore.currentReceipt?.queueNumber=== null ?   posStore.currentReceipt?.queueNumber+1 : posStore.queueNumber }}</h3>

            </div>
            <div class="pa-3" v-if="userStore.userRole !== 'พนักงานขายข้าว'">
              <div>
                <p class="d-flex justify-space-between pr-10 my-2">
                  <span style="text-align: start;"> สมาชิก</span>
                  <span style="text-align: end;color: black;">{{ posStore.receipt.customer?.customerName == null ? 'ไม่มี'
                    : posStore.receipt.customer?.customerName }}</span>
                </p>
              </div>
              <div>
                <p class="d-flex justify-space-between pr-10 my-2">
                  <span style="text-align: start;"> แต้มสะสม</span>
                  <span style="text-align: end;">{{ posStore.receipt.customer == null ? '0' :
                    posStore.receipt.customer?.customerNumberOfStamp }} Point</span>
                </p>
              </div>
              <p>เบอร์โทรลูกค้า</p>
            </div>
            <div v-if="userStore.userRole !== 'พนักงานขายข้าว'">
              <v-row class="d-flex align-center justify-start">
                <v-col cols="12" md="6" class="d-flex align-center justify-start">
                  <v-autocomplete v-model="selectedCustomer" :items="customerStore.customers.map(c => c.customerPhone)"
                    item-text="phone" item-value="phone" label="เบอร์โทรลูกค้า" variant="solo"
                    append-inner-icon="mdi-magnify"></v-autocomplete>
                </v-col>
                <v-col cols="12" md="5" class="d-flex align-center justify-start">
                  <v-btn class="mr-3" icon="mdi-account-plus" color="#ff9800" @click="openCreateCustomerDialog()"></v-btn>
                  <v-btn color="#ff9800" @click="openCreateCustomerDialog()">ประวัติการสั่งซื้อ</v-btn>
                </v-col>
              </v-row>
            </div>
            <v-divider></v-divider>

            <div class="d-flex justify-end pr-6">
              <v-btn color="red" variant="text" @click="cancelReceipt">ยกเลิกรายการ</v-btn>
            </div>
            <div :class="userStore.userRole === 'พนักงานขายข้าว' ? 'selected-items-list-50' : 'selected-items-list-40'">

              <v-list class="full-width" style="overflow-y: auto;">
                <v-list-item-group>
                  <div v-for="(item, index) in selectedItems" :key="index" class="selected-item full-width my-2">
                    <v-list-item :prepend-avatar="`http://localhost:3000/products/${item.product?.productId}/image`"
                      class="full-width">
                      <v-row style="padding: 0;">
                        <v-col cols="6" style="color: black;font-size: 16px;">
                          <div class="product-name">{{ item.product?.productName }}</div>
                        </v-col>
                        <v-col cols="6" class="text-right pr-8" style="color: black;font-size: 16px;">
                          <p>{{ item.receiptSubTotal.toFixed(2) }}</p>
                        </v-col>
                      </v-row>
                      <v-row style="padding: 0;">
                        <v-col cols="7" style="color: gray;font-size: 12px; padding-top: 0;">
                          <div v-if="item.product?.category.haveTopping"
                            style="font-weight: lighter;color: gray;font-size: 10px;">
                            {{ item.productType?.productTypeName }} +{{ item.productType?.productTypePrice }} | ความหวาน
                            {{ item.sweetnessLevel }}%
                          </div>
                          <div v-else>
                            <div style="font-weight: lighter;color: gray;font-size: 15px;">
                              {{ item.product?.productName }}( {{ item.product?.category.categoryName }} ) {{
                                item.product?.productPrice }}.-
                            </div>
                          </div>
                          <div v-if="item.productTypeToppings.length > 0">
                            <ul>
                              <li style="font-weight: lighter;color: gray;font-size: 11px;"
                                v-for="topping in item.productTypeToppings" :key="topping.topping.toppingId">
                                x{{ topping.quantity }} {{ topping.topping.toppingName }}: {{ topping.topping.toppingPrice
                                }}.-
                              </li>
                            </ul>
                          </div>
                        </v-col>
                        <v-col cols="5" style="padding-top: 0;">
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
            <div :class="userStore.userRole === 'พนักงานขายข้าว' ? 'summary-section-30' : 'summary-section-25'" style="width: 100%;">
              <v-divider></v-divider>
              <h3>สรุปรายการ</h3>
              <v-card-subtitle>โปรโมชั่น:</v-card-subtitle>
              <div :class="userStore.userRole === 'พนักงานขายข้าว' ? 'promotion-30' : 'promotion-20'">
                <div class="sub-promotion">
                  <div v-for="(promotion) in posStore.receipt.receiptPromotions" :key="promotion.receiptPromotionId"
                    style="text-align: end; width: 100%; padding-right: 40px;">
                    <div style="width: 100%;">
                      <span class="pa-2">{{ promotion.promotion.promotionType }}:</span>
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
                  <h3>{{ posStore.receipt.receiptNetPrice.toFixed(2) }}</h3>
                </v-col>
              </v-row>
            </div>
          </div>
          <div class="footer-buttons">
            <v-row class="d-flex justify-center pr-6" style="width: 100%;">
              <v-btn style="padding-right: 20px; width: 40%; margin-right: 10px;" color="secondary" rounded
                @click="nextStep">ชำระเงิน</v-btn>
              
            </v-row>
          </div>
        </div>
      </v-window-item>
      <v-window-item :value="2" class="full-height">
        <div class="content-container">
          <div class="title-detail">
            <div class="d-flex justify-space-between pr-6">
              <h3>รายละเอียดการสั่งซื้อ</h3>
              <h3>#{{ posStore.currentReceipt?.queueNumber=== null ?   posStore.currentReceipt?.queueNumber+1 : posStore.queueNumber }}</h3>

            </div>

            <div class="pa-3" v-if="userStore.userRole !== 'พนักงานขายข้าว'">
              <div>
                <p class="d-flex justify-space-between pr-10 my-2">
                  <span style="text-align: start;"> สมาชิก</span>
                  <span style="text-align: end;color: black;">{{ posStore.receipt.customer?.customerName == null ?
                    'ไม่มี' : posStore.receipt.customer?.customerName }}</span>
                </p>
              </div>
              <div>
                <p class="d-flex justify-space-between pr-10 my-2">
                  <span style="text-align: start;"> แต้มสะสม</span>
                  <span style="text-align: end;">{{ posStore.receipt.customer == null ? '0' :
                    posStore.receipt.customer?.customerNumberOfStamp }} Point</span>
                </p>
              </div>
              <p>เบอร์โทรลูกค้า</p>
            </div>
            <div v-if="userStore.userRole !== 'พนักงานขายข้าว'">
              <v-row class="d-flex align-center justify-start">
                <v-col cols="12" md="6" class="d-flex align-center justify-start mt-4">
                  <v-autocomplete v-model="selectedCustomer" :items="customerStore.customers.map(c => c.customerPhone)"
                    item-text="phone" item-value="phone" label="เบอร์โทรลูกค้า" variant="solo"
                    append-inner-icon="mdi-magnify"></v-autocomplete>
                </v-col>
                <v-col cols="12" md="5" class="d-flex align-center justify-start">
                  <v-btn class="mr-3" icon="mdi-account-plus" color="#ff9800"
                    @click="openCreateCustomerDialog()"></v-btn>
                  <v-btn color="#ff9800" @click="openCreateCustomerDialog()">ประวัติการสั่งซื้อ</v-btn>
                </v-col>
              </v-row>
            </div>
            <v-divider></v-divider>
          </div>
          <div class="payment-method">
            <h3>เลือกวิธีชำระเงิน</h3>
            <div class="d-flex align-center justify-center py-4">
              <v-btn :class="{ 'selected': posStore.receipt.paymentMethod === 'cash' }" class="payment-button"
                variant="outlined" style="color: black;" @click="selectPaymentMethod('cash')">
                เงินสด
              </v-btn>
              <v-btn :class="{ 'selected': posStore.receipt.paymentMethod === 'qrcode' }" class="payment-button"
                variant="outlined" style="color: black;" @click="selectPaymentMethod('qrcode')">
                แสกนจ่าย
              </v-btn>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="summary-section-2" style="width: 100%;padding: 20px;">
            <div>
              <h3>สรุปรายการ</h3>
              <div class="ma-2">
                <div>
                  <p class="d-flex justify-space-between pr-6">
                    <span style="text-align: start;"> สมาชิก:</span>
                    <span style="text-align: end;">{{ posStore.receipt.customer?.customerName == null ? 'ไม่มี' :
                      posStore.receipt.customer?.customerName }}</span>
                  </p>
                </div>
                <!-- ทั้งหมด -->
                <div>
                  <p class="d-flex justify-space-between pr-6 my-2">
                    <span style="text-align: start;"> ทั้งหมด:</span>
                    <span style="text-align: end;">{{ posStore.receipt.receiptTotalPrice.toFixed(2) }}</span>
                  </p>
                  <!-- รับมา -->
                  <div v-if="posStore.receipt.paymentMethod == 'cash'">
                    <p class="d-flex justify-space-between align-center pr-6 my-2">
                      <span style="text-align: start;"> รับมา:</span>
                      <span style="text-align: start;width: 50%;">
                        <v-responsive class="mx-auto" style="height: 10;">
                          <v-text-field v-model="recive" variant="solo" name="จำนวนเงิน" label="จำนวนเงิน"
                            id="id"></v-text-field>
                        </v-responsive>
                      </span>
                    </p>
                  </div>
                  <!-- ทอน -->
                  <div>
                    <p class="d-flex justify-space-between pr-6 my-2">
                      <span style="text-align: start;"> ทอน:</span>
                      <span style="text-align: end;"
                        :class="recive < 0 || recive < posStore.receipt.receiptNetPrice ? 'red--text' : 'black'">{{
                          change.toFixed(2) }}</span>
                    </p>
                  </div>
                  <v-divider></v-divider>
                  <v-row class="pt-1">
                    <v-col>
                      <h3>ราคาสุทธิ</h3>
                    </v-col>
                    <v-col style="text-align: end; color: #FF9642;padding-right: 65px;">
                      <h3>{{ posStore.receipt.receiptNetPrice.toFixed(2) }}</h3>
                    </v-col>
                  </v-row>
                  
                </div>
              </div>
            </div>
          </div>
          <div class="footer-buttons">
            <v-row class="d-flex justify-center pr-6" style="width: 100%;">
              <v-btn style="padding-right: 20px; width: 40%; margin-right: 10px;" color="secondary" rounded
                @click="prevStep">ย้อนกลับ</v-btn>
              <v-btn style="padding-right: 20px; width: 40%; margin-right: 10px;" color="#FF9642" rounded
                @click="save">บันทึก</v-btn>
            </v-row>
          </div>
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.selected-item {
  display: flex;
  align-items: center;
}

.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-detail {
  max-height: 30%;
  height: 60px;

}

.payment-method {
  max-height: 25%;
}

.summary-section-2 {
  height: 50%;
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

.selected-items-list-40 {
  max-height: 40%;
  height: 150px;
  overflow-y: auto;
}

.selected-items-list-50 {
  max-height: 60%;
  height: 250px;
  overflow-y: auto;
}

.promotion-20 {
  max-height: 20%;
  height: 70px;
  overflow-y: auto;
}

.promotion-30 {
  max-height: 30%;
  height: 150px;
  overflow-y: auto;
}

.summary-section-25 {
  height: 25%;
  margin-top: 20px;
}

.summary-section-30 {
  height: 30%;
  margin-top: 20px;
}

.red--text {
  color: red;
}

.payment-button {
  margin: 10px 10px;
  width: 150px;
  height: 60px;
  border: 2px solid orange;
  border-radius: 10px;
  color: black;
}

.payment-button.selected {
  background-color: #ff990047;
  color: black;
}

.pa-3 {
  padding: 1.5rem;
}

.pr-10 {
  padding-right: 10rem;
}

.my-2 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.content-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px); /* Adjust the height based on your app bar or other elements */
}

.footer-buttons {
  margin-top: auto;
  padding: 10px;
  width: 100%;
}
</style>


