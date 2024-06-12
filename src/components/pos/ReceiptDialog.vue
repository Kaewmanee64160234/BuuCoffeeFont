<template>
    <v-dialog v-model="posStore.receiptDialog" max-width="400">
        <v-card>
            <v-card-text>
                <div class="receipt-header text-center">
                    <h1>Buu library</h1>
                    <div class="dashed-line"></div>
                    <p>Queue: {{ posStore.currentReceipt?.receiptId }}</p>
                    <p>Staff: {{ posStore.currentReceipt?.user?.userName }}</p>
                    <p>Guests: {{ posStore.currentReceipt?.customer === null ?  "guest" : posStore.currentReceipt?.customer?.customerName
                     }}</p>
                    <p>Date: {{ posStore.currentReceipt?.createdDate }}</p>
                    <p>Time: {{ posStore.currentReceipt?.createdDate }}</p>
                    <div class="dashed-line"></div>
                </div>
                <div class="receipt-body">
                    <h2 class="text-center">Receipt</h2>
                    <div v-for="item in posStore.currentReceipt?.receiptItems" :key="item.receiptItemId"
                        class="receipt-item">
                        <p>{{ item.quantity }} {{ item.product?.productName }} <span class="float-right">{{
                                item.product?.productPrice }}</span></p>
                        <p v-if="item.productTypeToppings.length > 0" class="toppings">
                            <span v-for="topping in item.productTypeToppings" :key="topping.productTypeToppingId">
                                1x {{ topping.topping.toppingName }} ({{ topping.quantity }})
                            </span>
                        </p>
                    </div>
                </div>
                <div class="dashed-line"></div>
                <div class="receipt-summary">
                    <p>Items: {{ posStore.currentReceipt?.receiptItems.length }}</p>
                    <!-- loop show promotion from reciptPromotion -->
                    <p v-for="promotion in posStore.currentReceipt?.receiptPromotions"
                        :key="promotion.promotion.promotionId">
                        Promotion: {{ promotion.promotion.promotionName }} - {{ promotion.discount }}
                    </p>

                    <p class="total">Total: <span class="float-right">{{ posStore.currentReceipt?.receiptTotalPrice
                            }}</span></p>
                    <p class="discount">Discount: <span class="float-right">{{
                        posStore.currentReceipt?.receiptTotalDiscount }}</span></p>
                    <p class="net-total">Net Total: <span class="float-right">{{
                        posStore.currentReceipt?.receiptNetPrice }}</span></p>
                </div>
                <div class="dashed-line"></div>
                <div class="receipt-footer text-center">
                    <p>{{ posStore.currentReceipt?.paymentMethod?.toUpperCase() }}</p>
                </div>
            </v-card-text>
            <v-card-actions class="justify-center">
                <v-btn color="primary" @click="closeDialog">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { usePosStore } from '@/stores/pos.store';
import { ref } from 'vue';
const posStore = usePosStore();

const closeDialog = () => {
    posStore.receiptDialog = false;
};


</script>

<style scoped>
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
}

.receipt-item {
    margin-bottom: 5px;
}

.total,
.discount,
.net-total {
    font-weight: bold;
}
</style>