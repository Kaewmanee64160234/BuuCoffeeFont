<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { usePosStore } from "@/stores/pos.store";
import { useCustomerStore } from "@/stores/customer.store";
import Swal from "sweetalert2";
import AddCustomerDialog from "../customer/AddCustomerDialog.vue";
import type { Receipt, ReceiptItem } from "../../types/receipt.type";
import type { Promotion } from "../../types/promotion.type";
import { useUserStore } from "@/stores/user.store";
import { useReceiptStore } from "@/stores/receipt.store";
import ReceiptDetailsDialogPos from "../receipts/ReceiptDialogPos.vue";
import DrinkSelectionDialog from "./DrinkSelectionDialog.vue";

const step = ref(1);
const posStore = usePosStore();
const customerStore = useCustomerStore();
const userStore = useUserStore();
const selectedItems = computed(() => posStore.selectedItems);
const selectedCustomer = ref("");
const receiptStore = useReceiptStore();
const url = import.meta.env.VITE_URL_PORT;

onMounted(async () => {
  await receiptStore.getRecieptIn30Min("ร้านข้าว");
  await loadQueueListFromLocalStorage();
  const currentDate = new Date().toLocaleDateString(); // Get current date as a string
  posStore.receipt.paymentMethod = "cash";
  // Check if the queue number needs to be reset for a new day
  const lastResetDate = localStorage.getItem("lastResetDate");
  console.log("Last reset date:", lastResetDate);
  console.log("Current date:", currentDate);

  if (lastResetDate === currentDate) {
    if (posStore.queueReceipt.length > 0) {
      posStore.queueNumber =
        posStore.queueReceipt[posStore.queueReceipt.length - 1].queueNumber + 1;
    } else {
      const auateData = localStorage.getItem("queueData");
      if (auateData) {
        posStore.queueNumber = JSON.parse(auateData).number + 1;
      } else {
        posStore.queueNumber = 1;
      }
    }
  } else {
    posStore.queueNumber = 1;
    // set new lastResetDate
    localStorage.setItem("lastResetDate", currentDate);
  }
});

function nextStep() {
  if (selectedItems.value.length === 0) {
    Swal.fire({
      icon: "error",
      title: "ข้อมูลไม่สมบูรณ์",
      text: "กรุณาเพิ่มรายการอย่างน้อยหนึ่งรายการในใบเสร็จ",
    });
    return;
  }
  if (posStore.receipt.paymentMethod === "" && step.value === 2) {
    Swal.fire({
      icon: "error",
      title: "ข้อมูลไม่สมบูรณ์",
      text: "กรุณาเลือกวิธีการชำระเงิน",
    });
    return;
  }
  step.value++;
  console.log("Next Step:", step.value);
}

function prevStep() {
  step.value--;
  console.log("Previous Step:", step.value);
}

function removeItem(index: number) {
  posStore.removeItem(index);
}

function calculateChange() {
  if (posStore.receipt.paymentMethod === "cash") {
    posStore.receipt.change =
      posStore.receipt.receive - posStore.receipt.receiptNetPrice;
  }
}

function openReceiptDialog() {
  posStore.ReceiptDialogPos = true;
  console.log(" openReceiptDialog ", posStore.ReceiptDialogPos);
}

function selectPaymentMethod(method: string) {
  console.log(`Selected payment method: ${method}`);
  posStore.receipt.paymentMethod = method;
  if (method === "cash") {
    calculateChange();
  } else {
    posStore.receipt.change = 0;
  }
}

watch(
  () => posStore.receipt.receive,
  () => {
    calculateChange();
  }
);

function increaseQuantity(item: ReceiptItem) {
  // console.log('increase quantity', item);
  if (item.product?.haveTopping) {
    if (item.productTypeToppings.length > 0) {
      posStore.addToReceipt(
        item.product,
        item.productType,
        item.productTypeToppings,
        1,
        item.sweetnessLevel
      );
    } else {
      posStore.addToReceipt(
        item.product,
        item.productType,
        [],
        1,
        item.sweetnessLevel
      );
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

async function save() {
  if (selectedItems.value.length === 0) {
    Swal.fire({
      icon: "error",
      title: "ข้อมูลไม่สมบูรณ์",
      text: "กรุณาเพิ่มรายการอย่างน้อยหนึ่งรายการในใบเสร็จ",
    });
    return;
  }
  if (posStore.receipt.paymentMethod === "") {
    Swal.fire({
      icon: "error",
      title: "ข้อมูลไม่สมบูรณ์",
      text: "กรุณาเลือกวิธีการชำระเงิน",
    });
    return;
  }
  if (
    posStore.receipt.paymentMethod === "cash" &&
    posStore.receipt.receive < posStore.receipt.receiptNetPrice
  ) {
    Swal.fire({
      icon: "error",
      title: "ข้อมูลไม่สมบูรณ์",
      text: "กรุณาป้อนจำนวนเงินสดที่ได้รับที่ถูกต้อง",
    });
    return;
  }
  if (posStore.receipt.receiptId) {
    posStore.updateReceipt(
      posStore.receipt.receiptId,
      posStore.receipt,
      "ร้านข้าว"
    );
  } else {
    posStore.createReceipt("ร้านข้าว");
  }

  // Save the current state of the queue after updating/creating the receipt
  posStore.selectedItems = [];
  posStore.receipt.receiptTotalPrice = 0;
  posStore.receipt.receiptTotalDiscount = 0;
  posStore.receipt.receiptNetPrice = 0;
  posStore.receipt.receiptPromotions = [];
  posStore.receiptDialog = true;
  posStore.receipt.receive = 0;
  posStore.receipt.change = 0;
  step.value = 1;
  posStore.receipt.paymentMethod = "";
  posStore.receipt.customer = null;
  posStore.receipt.receiptStatus = "รอชำระเงิน";
  selectedCustomer.value = "";
  await receiptStore.getRecieptIn30Min("ร้านข้าว");

}

function openCreateCustomerDialog() {
  customerStore.openDialogRegisterCustomer = true;
}
const loadQueueListFromLocalStorage = () => {
  const storedQueueList = localStorage.getItem("queueReceipt");
  console.log(storedQueueList);

  if (storedQueueList) {
    posStore.queueReceipt = JSON.parse(storedQueueList);
  } else {
    posStore.queueReceipt = []; // Initialize if not found
    posStore.saveQueueListToLocalStorage(); // Save initial empty list
  }
};
function cancelReceipt() {
  posStore.selectedItems = [];
  posStore.receipt = {
    receiptTotalPrice: 0,
    receiptTotalDiscount: 0,
    receiptNetPrice: 0,
    receiptPromotions: [],
    receiptItems: [],
    receiptStatus: "รอชำระเงิน",
    paymentMethod: "",
    createdDate: new Date(),
    queueNumber: posStore.queueNumber,
    receiptType: "",
    updatedDate: new Date(),
  };

  posStore.receiptDialog = false;

  posStore.receipt.receive = 0;
  posStore.receipt.change = 0;
  step.value = 1;
  posStore.receipt.paymentMethod = "";
}

function removePromotion(promotion: Promotion) {
  posStore.removePromotion(promotion);
}

function openProductCardDialog(item: ReceiptItem) {
  if (item.product?.haveTopping) {
    posStore.selectedItemForEdit = item;
    console.log("Selected Product:", posStore.selectedItemForEdit);
    posStore.toppingDialog = true;
  } else {
    console.error(
      "This product does not have toppings or product is undefined"
    );
  }
}

watch(
  () => selectedCustomer.value,
  () => {
    if (selectedCustomer.value === "" || selectedCustomer.value === null) {
      posStore.receipt.customer = null;
      return;
    }
    findCustomer();
  }
);

function findCustomer() {
  console.log("Selected customer:", selectedCustomer.value);
  const customer = customerStore.customers.find(
    (c) => c.customerPhone === selectedCustomer.value
  );
  console.log("Customer found:", customer);

  if (customer) {
    posStore.receipt.customer = customer;
  } else {
    Swal.fire({
      icon: "error",
      title: "ไม่พบลูกค้า",
      text: "ไม่พบลูกค้าที่มีหมายเลขโทรศัพท์นี้",
    });
  }
}

const selectReceipt = (receipt: Receipt) => {
  receipt.receiptItems = receipt.receiptItems.map((item) => ({
    ...item,
    quantity: parseInt(item.quantity.toString(), 10),
  }));

  posStore.receipt = receipt;
  posStore.selectedItems = receipt.receiptItems;
  posStore.ReceiptDialogPos = false;

  console.log("Selected Receipt:", receipt);
};
</script>

<template>
  <ReceiptDetailsDialogPos />
  <DrinkSelectionDialog />
  <div>
    <AddCustomerDialog />

    <v-window
      v-model="step"
      transition="fade"
      class="h-screen"
    >
      <!-- Order Details View -->
      <v-window-item :value="1" class="full-height">
        <div class="content-container">
          <div class="header">
            <div class="d-flex justify-space-between align-center header-info">
              <h3 class="order-title">รายละเอียดการสั่งซื้อ</h3>
              <h3 class="queue-number">#{{ posStore.queueNumber }}</h3>
            </div>
            <v-divider class="mb-4"></v-divider>

            <!-- Customer Actions -->
            <v-row class="d-flex align-center justify-end customer-actions">
              <v-col cols="12" md="3" class="d-flex align-center justify-end mr-8">
                <v-btn class="receipt-history-btn" @click="openReceiptDialog()">
                  ประวัติการสั่งซื้อ
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <div>
              <v-row>
                <v-col cols="12" md="6">
                  <h3 class="order-summary-title">สรุปรายการ</h3>
                </v-col>
                <v-col cols="12" md="5" class="text-end ml-5">
                  <p @click="cancelReceipt()" class="cancel-receipt">
                    ยกเลิกรายการ
                  </p>
                </v-col>
              </v-row>
            </div>

            <!-- Promotions Section -->
            <div class="promotions-section">
              <promotion-cards-carousel></promotion-cards-carousel>
              <PromotionUsePointDialog />
            </div>

            <!-- Selected Items List -->
            <div class="selected-items-list">
              <v-list class="full-width" style="height: 25vh">
                <v-list-item-group>
                  <div
                    v-for="(item, index) in selectedItems"
                    :key="index"
                    class="selected-item full-width my-2 card-item"
                  >
                    <v-list-item
                      @click="openProductCardDialog(item)"
                      :prepend-avatar="`${url}/products/${item.product?.productId}/image`"
                      class="full-width item-row"
                    >
                      <v-row no-gutters>
                        <v-col cols="6" class="product-name">
                          {{ item.product?.productName }}
                        </v-col>
                        <v-col cols="6" class="text-right product-price">
                          <p>{{ item.receiptSubTotal }}</p>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col cols="7">
                          <div
                            v-if="item.product?.haveTopping"
                            class="product-details"
                          >
                            {{ item.productType?.productTypeName }} +{{
                              item.productType?.productTypePrice
                            }}
                            | ความหวาน {{ item.sweetnessLevel }}%
                          </div>
                          <div v-else>
                            <div class="product-details">
                              {{ item.product?.productName }} ({{
                                item.product?.category.categoryName
                              }}) {{ item.product?.productPrice }}.-
                            </div>
                          </div>
                          <div
                            v-if="
                              item.productTypeToppings &&
                              item.productTypeToppings.length > 0
                            "
                          >
                            <ul class="toppings-list">
                              <li
                                v-for="topping in item.productTypeToppings"
                                :key="topping?.topping?.toppingId"
                                class="topping-item"
                              >
                                x{{ topping?.quantity }}
                                {{ topping?.topping?.toppingName }}
                                <span
                                  v-if="
                                    topping?.topping?.toppingName &&
                                    topping.topping.toppingName.length > 3
                                  "
                                >
                                  : {{ topping?.topping?.toppingPrice }}.-
                                </span>
                              </li>
                            </ul>
                          </div>
                        </v-col>
                        <v-col cols="5" class="text-end">
                          <div class="quantity-controls">
                            <v-btn
                              size="xs-small"
                              color="#C5C5C5"
                              icon
                              @click.stop="decreaseQuantity(index)"
                            >
                              <v-icon>mdi-minus</v-icon>
                            </v-btn>
                            <span class="quantity">{{ item.quantity }}</span>
                            <v-btn
                              size="xs-small"
                              color="#FF9642"
                              icon
                              @click.stop="increaseQuantity(item)"
                            >
                              <v-icon>mdi-plus</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              variant="text"
                              @click.stop="removeItem(index)"
                            >
                              <v-icon color="red">mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </v-list-item-group>
              </v-list>
            </div>

            <!-- Order Summary -->
            <div >
              <v-divider class="divider"></v-divider>
              <h3 class="order-summary-title">สรุปรายการ</h3>
              <v-card-subtitle class="mt-2">โปรโมชั่น:</v-card-subtitle>
              <div class="promotion-30">
                <div class="sub-promotion">
                  <div
                    v-for="promotion in posStore.receipt.receiptPromotions"
                    :key="promotion.receiptPromotionId"
                    class="promotion-row"
                  >
                    <span class="promotion-name"
                      >{{ promotion.promotion.promotionName }}:</span
                    >
                    <span class="promotion-discount red--text"
                      >{{ promotion.discount }} $</span
                    >
                    <v-btn
                      size="small"
                      icon
                      variant="text"
                      @click="removePromotion(promotion.promotion)"
                    >
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
              <v-divider></v-divider>
              <v-row class="py-3">
                <v-col>
                  <h3>ราคาสุทธิ</h3>
                </v-col>
                <v-col class="text-end total-price">
                  <h3>{{ posStore.receipt.receiptNetPrice }}</h3>
                </v-col>
              </v-row>
            </div>
          </div>
          <div class="footer-buttons">
            <v-row class="d-flex justify-center pr-6">
              <v-btn class="next-step-btn mt-2" rounded @click="nextStep">
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
            <div class="d-flex justify-space-between align-center header-info">
              <h3 class="order-title">รายละเอียดการสั่งซื้อ</h3>
              <h3 class="queue-number">#{{ posStore.queueNumber }}</h3>
            </div>
            <v-divider class="my-4"></v-divider>
          </div>

          <!-- Payment Method Selection -->
          <div class="payment-method">
            <h3 class="payment-title">เลือกวิธีชำระเงิน</h3>
            <v-row class="pa-3 justify-center">
              <div class="payment-buttons-container mt-4">
                <v-btn
                  :class="{
                    selected: posStore.receipt.paymentMethod === 'cash',
                  }"
                  class="payment-button"
                  @click="selectPaymentMethod('cash')"
                >
                  เงินสด
                </v-btn>
                <v-btn
                  :class="{
                    selected: posStore.receipt.paymentMethod === 'qrcode',
                  }"
                  class="payment-button"
                  @click="selectPaymentMethod('qrcode')"
                >
                  แสกนจ่าย
                </v-btn>
              </div>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Summary Section -->
          <div class="summary-section-2">
            <div class="ma-2">
              <p class="d-flex justify-space-between pr-6 my-2">
                <span>ทั้งหมด:</span>
                <span class="info-value">{{
                  posStore.receipt.receiptTotalPrice
                }}</span>
              </p>

              <div v-if="posStore.receipt.paymentMethod === 'cash'">
                <p class="d-flex justify-space-between align-center pr-6 my-2">
                  <span style="width: 50%">รับมา:</span>
                  <v-text-field
                    v-model="posStore.receipt.receive"
                    type="number"
                    variant="solo"
                    label="จำนวนเงิน"
                    style="width: 50%"
                  ></v-text-field>
                </p>
              </div>

              <!-- Change Amount -->
              <p class="d-flex justify-space-between pr-6 my-2">
                <span>ทอน:</span>
                <span
                  :class="
                    posStore.receipt.receive < 0 ||
                    posStore.receipt.receive < posStore.receipt.receiptNetPrice
                      ? 'red--text'
                      : 'black'
                  "
                  class="info-value"
                >
                  {{
                    parseFloat(posStore.receipt.change) < 0
                      ? "จำนวนเงินไม่พอ"
                      : posStore.receipt.change
                  }}
                </span>
              </p>

              <v-divider class="my-4"></v-divider>

              <!-- Net Price -->
              <v-row class="pt-4">
                <v-col>
                  <h3>ราคาสุทธิ</h3>
                </v-col>
                <v-col class="text-end total-price">
                  <h3>{{ posStore.receipt.receiptNetPrice }}</h3>
                </v-col>
              </v-row>
            </div>
          </div>

          <div class="footer-buttons">
            <v-row class="d-flex justify-center pr-6">
              <v-btn class="prev-step-btn mt-5" rounded @click="prevStep"
                >ย้อนกลับ</v-btn
              >
              <v-btn class="save-btn mt-5 ml-3" rounded @click="save"
                >ยืนยันการชำระเงิน</v-btn
              >
            </v-row>
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
  background-color: #f9f9f9;
}

.full-height {
  height: 100%;
}

.window-container {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.header-info {
  padding-right: 40px;
}

.order-title,
.queue-number {
  color: #333;
  font-weight: 600;
}

.customer-actions {
  margin-top: 20px;
}

.receipt-history-btn {
  color: #fff;
  background-color: #ff9642;
  border-radius: 8px;
}

.cancel-receipt {
  color: red;
  cursor: pointer;
  font-weight: bold;
}

.promotions-section,
.selected-items-list {
  overflow-y: auto;
  max-height: 20vh;
  margin-bottom: 10px;
  padding-right: 10px;
}

.selected-items-list-50 {
  overflow-y: auto;
  max-height: 35vh;
  margin-bottom: 20px;
  margin-right: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-item {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  color: #333;
}

.product-details {
  font-size: 14px;
  color: #555;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.quantity {
  font-size: 14px;
  font-weight: bold;
}

.summary-section-30 {
  margin-top: 20px;
  padding: 20px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.promotion-30 {
  height: 15vh;
  overflow-y: auto;
}

.promotion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 40px;
}

.promotion-name {
  font-weight: 600;
}

.promotion-discount {
  font-size: 14px;
  font-weight: bold;
}

.total-price {
  color: #ff9642;
  font-weight: bold;
  padding-right: 65px;
}

.payment-method {
  height: 30%;
}

.payment-title {
  color: #333;
  font-weight: 600;
}

.payment-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.payment-button {
  margin: 10px;
  width: 150px;
  height: 70px;
  border-radius: 10px;
  border: 2px solid #ff9800;
  color: black;
  transition: background-color 0.3s, color 0.3s;
}

.payment-button.selected {
  background-color: #ff9800;
  color: white;
}

.footer-buttons {
  margin-top: auto;
  padding: 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.next-step-btn,
.prev-step-btn,
.save-btn {
  width: 40%;
  background-color: #ff9642;
  color: white;
  transition: transform 0.2s ease-in-out;
}

.next-step-btn:hover,
.prev-step-btn:hover,
.save-btn:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .content-container {
    padding: 10px;
  }

  .payment-button {
    width: 100px;
    height: 40px;
  }

  .selected-items-list-50 {
    max-height: 30vh;
  }

  .summary-section-30 {
    height: 30%;
  }

  .footer-buttons {
    flex-direction: column;
    align-items: center;
  }

  .footer-buttons > v-btn {
    width: 90%;
    margin-bottom: 10px;
  }
}

.divider {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
