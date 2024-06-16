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

<template>
  <v-dialog v-model="posStore.receiptDialog" max-width="400">
    <v-card>
      <v-card-text ref="receiptContent">
        <div class="receipt-content" id="printableArea">
          <div class="receipt-header text-center">
            <h4 class="header-text">Buu Library</h4>
            <div class="dashed-line"></div>
            <div class="d-flex justify-space-between">
              <p style="text-align: start">Queue: {{ posStore.currentReceipt?.receiptId }}</p>
              <p style="text-align: start">#{{ posStore.currentReceipt?.receiptId }}</p>
            </div>
            <p style="text-align: start">Staff: {{ posStore.currentReceipt?.user?.userName }}</p>
            <p style="text-align: start">
              Guests: {{
                posStore.currentReceipt?.customer === null
                  ? "guest"
                  : posStore.currentReceipt?.customer?.customerName
              }}
            </p>
            <div class="d-flex justify-space-between">
              <p style="text-align: start">Date: {{ formattedDate }}</p>
              <p style="text-align: start">Time: {{ formattedTime }}</p>
            </div>

            <div class="dashed-line"></div>
          </div>
          <div class="receipt-body">
            <h4 class="text-center">Receipt</h4>
            <div v-for="item in posStore.currentReceipt?.receiptItems" :key="item.receiptItemId" class="receipt-item">
              <div class="item-details">
                <div class="item-info d-flex justify-space-between ">
                  <p class="product-name">{{ item.quantity }} x {{ item.product?.productName }} {{
                    item.product?.category.haveTopping ? item.productType?.productTypeName : '' }}</p>
                  <p class="product-price">{{ item.receiptSubTotal.toFixed(2) }} ฿</p>
                </div>
              </div>
              <p class="toppings" v-if="item.product?.category.haveTopping">
                ความหวาน {{ item.sweetnessLevel }}%
              </p>
              <p v-if="item.productTypeToppings.length > 0" class="toppings">
                <span v-for="topping in item.productTypeToppings" :key="topping.productTypeToppingId">
                  {{ topping.quantity }}x {{ topping.topping.toppingName }} <br>
                </span>
              </p>
            </div>
          </div>
          <div class="dashed-line"></div>
          <div class="receipt-summary">
            <p>Items: {{ posStore.currentReceipt?.receiptItems.length }}</p>
            <p>Promotions:</p>
            <div v-if="posStore.currentReceipt?.receiptNetPrice" class="promotion">
              <div class="d-flex justify-space-between toppings"
                v-for="promotion in posStore.currentReceipt?.receiptPromotions" :key="promotion.promotion.promotionId">
                <p>{{ promotion.promotion.promotionName }}</p>
                <p> {{ promotion.discount }} ฿</p>
              </div>
            </div>



            <p class="total">
              Total:
              <span class="float-right">{{ posStore.currentReceipt?.receiptTotalPrice }} ฿</span>
            </p>
            <p class="discount">
              Discount:
              <span class="float-right">{{ posStore.currentReceipt?.receiptTotalDiscount }} ฿</span>
            </p>
            <p class="net-total">
              Net Total:
              <span class="float-right">{{ posStore.currentReceipt?.receiptNetPrice }} ฿</span>
            </p>
          </div>
          <div class="dashed-line"></div>
          <div class="receipt-footer text-center">
            <p>{{ posStore.currentReceipt?.paymentMethod?.toUpperCase() }}</p>
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
  /* display: flex;
  align-items: center; */
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
.net-total {
  font-weight: bold;
}

.v-card-actions {
  display: flex;
  justify-content: space-between;
}

.v-btn {
  width: 45%;
}

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
  }
}
</style>
