<template>
  <v-dialog v-model="reciptStore.receiptOld" max-width="400">
    <v-card>
      <v-card-text ref="receiptContent">
        <div class="receipt-content" id="printableArea">
          <div class="receipt-header text-center">
            <h4 class="header-text">Café@Library</h4>
            <div class="dashed-line"></div>
            <div class="d-flex justify-space-between">
              <p style="text-align: start">Queue: {{ reciptStore.receipt?.queueNumber }}</p>
              <p style="text-align: start">#{{ reciptStore.receipt?.receiptNumber }}</p>
            </div>
            <p style="text-align: start">Staff: {{ reciptStore.receipt?.user?.userName }}</p>
            <p style="text-align: start">
              Guests: {{
                reciptStore.receipt?.customer === null
                  ? "guest"
                  : reciptStore.receipt?.customer?.customerName
              }}
            </p>
            <div class="d-flex justify-space-between">
              <p style="text-align: start">Date: {{ formatDate (reciptStore.receipt?.updatedDate )}}</p>
            </div>
            <div class="dashed-line"></div>
          </div>
          <div class="receipt-body">
            <h4 class="text-center">Receipt</h4>
            <div v-for="item in reciptStore.receipt?.receiptItems" :key="item.receiptItemId" class="receipt-item">
              <div class="item-details">
                <div class="item-info d-flex justify-space-between">
                  <p class="product-name">
                    {{ item.quantity }} x {{ item.product?.productName }} {{
                      item.product?.category.haveTopping ? item.productType?.productTypeName : '' }}
                  </p>
                  <p class="product-price">{{ item.receiptSubTotal.toFixed(2) }} ฿</p>
                </div>
              </div>
              <p class="toppings" v-if="item.product?.category.haveTopping">
                ความหวาน {{ item.sweetnessLevel }}%
              </p>
              <p v-if="item.productTypeToppings && item.productTypeToppings.length > 0 && item.product?.category.haveTopping"
                class="toppings">

                <span v-for="topping in item.productTypeToppings" :key="topping.productTypeToppingId">

                  <span v-if="topping.topping">
                    {{ topping.quantity }} x {{ topping.topping.toppingName }}
                    ({{ topping.topping.toppingPrice ? topping.topping.toppingPrice : 0 }} ฿) <br>
                  </span>
                </span>
              </p>
            </div>
          </div>
          <div class="dashed-line"></div>
          <div class="receipt-summary">
            <p>Items: {{ reciptStore.receipt?.receiptItems.length }}</p>
            <p>Promotions:</p>
            <div class="d-flex justify-space-between toppings"
              v-for="promotion in reciptStore.receipt?.receiptPromotions" :key="promotion.promotion.promotionId">
              <p>{{ promotion.promotion.promotionName }}</p>
              <p> {{ promotion.discount }} ฿</p>
            </div>
            <p class="total">
              Total:
              <span class="float-right">{{ reciptStore.receipt?.receiptTotalPrice }} ฿</span>
            </p>

            <p class="discount">
              Discount:
              <span class="float-right">{{ reciptStore.receipt?.receiptTotalDiscount }} ฿</span>
            </p>
            <p class="received">
              Received:
              <span class="float-right">{{ reciptStore.receipt?.receive }} ฿</span>
            </p>
            <p class="change">
              Change:
              <span class="float-right">{{ reciptStore.receipt?.change }} ฿</span>
            </p>
            <p class="net-total">
              Net Total:
              <span class="float-right">{{ reciptStore.receipt?.receiptNetPrice }} ฿</span>
            </p>

          </div>
          <div class="dashed-line"></div>
          <div class="receipt-footer text-center">
            <p>{{ reciptStore.receipt?.paymentMethod?.toUpperCase() }}</p>
          </div>
          <div class="dashed-line"></div>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="closeDialog">Close</v-btn>
        <v-btn color="secondary" @click="printReceipt">Print</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
import { useReceiptStore } from '@/stores/receipt.store';
const receiptContent = ref(null);
const reciptStore = useReceiptStore()
function closeDialog() {
  reciptStore.receipt = null;
  reciptStore.historyReceiptDialog = false;
}

const printReceipt = () => {
  const printContents = document.getElementById('printableArea')!.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  document.body.style.zoom = "0.7"; // Set zoom to 70% for the print

  window.print();

  document.body.innerHTML = originalContents;
  window.location.reload();


};

const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};


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
  width: 57mm;
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
  margin-bottom: 15px;
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
    transform: scale(0.7);
    /* Scale the content to 70% */
    transform-origin: top left;
  }
}
</style>
