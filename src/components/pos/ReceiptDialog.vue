<template>
  <v-dialog v-model="posStore.receiptDialog" max-width="400">
    <v-card>
      <v-card-text ref="receiptContent">
        <div class="receipt-content" id="printableArea">
          <div class="receipt-header text-center">
            <h4 class="header-text">Café@Library</h4>
            <div class="dashed-line"></div>
            <h4 class="text-center">ใบแจ้งรายการ</h4>
            <div class="dashed-line"></div>
            <div class="d-flex justify-space-between">
              <p style="text-align: start">คิวที่ : {{ posStore.currentReceipt?.queueNumber }}</p>
            </div>
            <p style="text-align: start">พนักงานออกใบเสร็จ : {{ posStore.currentReceipt?.user?.userName }}</p>
            <div class="d-flex justify-space-between">
              <p style="text-align: start">
                ชื่อลูกค้า : {{
                  posStore.currentReceipt?.customer === null
                    ? "guest"
                    : posStore.currentReceipt?.customer?.customerName
                }}
              </p>
              <p style="text-align: start">ID : {{ posStore.currentReceipt?.receiptNumber }}</p>
            </div>
            
            <div class="d-flex justify-space-between">
              <p style="text-align: start">วันที่ออกใบเสร็จ : {{ formattedDate }}</p>
              <p style="text-align: start">เวลา : {{ formattedTime }}</p>
            </div>
            
          </div>
          <div class="receipt-body">
            <div class="dashed-line"></div>
            <div class="d-flex justify-space-between">
              <p style="text-align: start" class="ml-4">สินค้า</p>
              <p style="text-align: start">ราคา</p>
            </div>
            <div class="dashed-line"></div>
            
            <div v-for="item in posStore.currentReceipt?.receiptItems" :key="item.receiptItemId" class="receipt-item">
              <div class="item-details">
                <div class="item-info d-flex justify-space-between">
                  <p class="product-name">
                    {{ item.quantity }} x {{ item.product?.productName }} {{
                      item.product?.haveTopping ? item.productType?.productTypeName : '' }}
                  </p>
                  <p class="product-price">{{ parseFloat(item.receiptSubTotal + '').toFixed(2) }} </p>
                </div>
              </div>
              <p class="toppings" v-if="item.product?.haveTopping">
                ความหวาน {{ item.sweetnessLevel }}%
              </p>
              <p v-if="item.productTypeToppings && item.productTypeToppings.length > 0 && item.product?.haveTopping"
                class="toppings">
                <span v-for="topping in item.productTypeToppings" :key="topping.productTypeToppingId">
                  <span v-if="topping.topping">
                    {{ topping.quantity }} x {{ topping.topping.toppingName }}
                    ({{ topping.topping.toppingPrice ? topping.topping.toppingPrice : 0 }}) <br>
                  </span>
                </span>
              </p>
            </div>
          </div>
          <div class="dashed-line"></div>
          <div class="receipt-summary">
            <p>จำนวนสินค้าที่ซื้อ : {{ posStore.currentReceipt?.receiptItems.length }}</p>
            <p>รูปแบบการจ่ายเงิน : {{ posStore.currentReceipt?.paymentMethod?.toUpperCase() }}</p>
            <p>โปรโมชันที่ใช้ :</p>
            <div class="d-flex justify-space-between toppings"
              v-for="promotion in posStore.currentReceipt?.receiptPromotions" :key="promotion.promotion.promotionId">
              <p>{{ promotion.promotion.promotionName }}</p>
              <p> {{ (promotion.discount ) }}</p>
            </div>
            <p class="total">
              ยอดเงินรวม :
              <span class="float-right">{{ (posStore.currentReceipt?.receiptTotalPrice ) }}</span>
            </p>

            <p class="discount">
              ส่วนลด :
              <span class="float-right">{{ (posStore.currentReceipt?.receiptTotalDiscount ) }} </span>
            </p>
            <p class="received">
              เงินที่ได้รับ :
              <span class="float-right">{{ (posStore.currentReceipt?.receive )}} </span>
            </p>
            <p class="change">
              เงินทอน :
              <span class="float-right">{{ (posStore.currentReceipt?.change )}} </span>
            </p>
            <p class="net-total">
              ยอดรวมสุทธิ :
              <span class="float-right">{{ (posStore.currentReceipt?.receiptNetPrice ) }} </span>
            </p>
          </div>
          <div class="dashed-line"></div>
          <div class="receipt-footer text-center" style="font-size: 35px;">
            <p>THANK YOU</p>
          </div>
          <div class="dashed-line"></div>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="closeDialog">ปิด</v-btn>
        <v-btn color="secondary" @click="printReceipt">พิมพ์ใบเสร็จ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>



<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

const posStore = usePosStore();
const receiptContent = ref(null);

const closeDialog = () => {
  posStore.receiptDialog = false;
};

const printReceipt = () => {
  const printContents = document.getElementById('printableArea')!.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  document.body.style.zoom = "0.7"; // Set zoom to 70% for the print

  window.print();

  document.body.innerHTML = originalContents;
  window.location.reload();


};

const formattedDate = computed(() => {
  return dayjs(posStore.currentReceipt?.createdDate).format('DD/MM/YYYY');
});

const formattedTime = computed(() => {
  return dayjs(posStore.currentReceipt?.createdDate).format('HH:mm');
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playwrite+NL:wght@100..400&display=swap');

.header-text {
  font-family: 'Playwrite NL', sans-serif;
  font-size: 15px;
  font-weight: 400;
  padding-bottom: 10px;
}

.receipt-content {
  width: 77mm;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}

.receipt-header,
.receipt-body,
.receipt-summary,
.receipt-footer {
  margin-bottom: 10px;
}

.dashed-line {
  border-top: 1px dashed black;
  margin: 10px 0;
}

.text-center {
  text-align: center;
}

.float-right {
  float: right;
}

.toppings {
  font-size: 0.9em;
  margin-left: 15px;
  color: #555;
}

.receipt-item {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.item-details {
  margin-bottom: 5px;
}

.product-name {
  font-weight: bold;
  margin: 0;
}

.product-price {
  color: #777;
  margin: 0;
}

.total,
.discount,
.net-total,
.received,
.change {
  font-weight: bold;
}

.v-card-actions {
  display: flex;
  justify-content: space-between;
}

.v-btn {
  width: 45%;
}

/* Adjust the print size */
@media print {
  body * {
    visibility: hidden;
  }

  #printableArea,
  #printableArea * {
    visibility: visible;
  }

  #printableArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    transform: scale(0.7); /* Scale the content to 70% */
    transform-origin: top left;
  }
}
</style>
