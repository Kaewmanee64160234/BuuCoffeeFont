<script lang="ts" setup>
import { computed } from 'vue';
import { useReceiptStore } from '@/stores/receipt.store';

const receiptStore = useReceiptStore()


const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};

function closeDialog() {
  receiptStore.receipt = null;
  receiptStore.historyReceiptDialog = false;
}
</script>

<template>
  <v-dialog v-model="receiptStore.historyReceiptDialog" max-width="1090px">
    <v-card>
      <v-card-title>
        <!-- 1 -->
        <v-row>
          <v-col cols="6">
            <v-icon color="primary" style="font-size: 30px;">mdi-calendar-month</v-icon>
            <strong style="font-size: 18px; margin-left: 8px;">บันทึกการสั่งซื้อ{{ receiptStore.receipt?.receiptType }} วันที่ : {{
              formatDate(receiptStore.receipt?.createdDate) }}</strong>
          </v-col>
          <v-col cols="6" class="text-right">


            <span v-if="receiptStore.receipt?.receiptStatus === 'cancel'">
              <v-icon color="red" style="font-size: 30px;">mdi-calendar-remove-outline</v-icon>
              <strong style="font-size: 18px; margin-left: 8px;">บันทึกการสั่งซื้อ วันที่ : {{
                formatDate(receiptStore.receipt?.updatedDate) }}</strong>
            </span>

          </v-col>
        </v-row>
        <v-row>

        </v-row>

        <!-- 2 -->
        <v-row>
          <v-col style="padding-top: 4px;" cols="6" >
            <v-icon color="primary" left style="font-size: 20px;">mdi-account-supervisor-circle</v-icon>
            <strong style="font-size: 16px;"> ลูกค้า : </strong>
            <span style="font-size: 14px;">
              {{ receiptStore.receipt?.customer?.customerName || 'ไม่มีข้อมูล' }}
            </span>
          </v-col>

          <v-col style="padding-top: 4px;" class="text-right" cols="6" >
            <strong style="font-size: 16px;">
              สถานะ :
              <template v-if="receiptStore.receipt?.receiptStatus === 'paid'">
                {{ receiptStore.receipt?.receiptStatus }} <v-icon color="primary" left style="font-size: 20px;">mdi-check</v-icon>
              </template>
              <template v-if="receiptStore.receipt?.receiptStatus === 'cancel'">
                {{ receiptStore.receipt?.receiptStatus }} <v-icon color="primary" left style="font-size: 20px;">mdi-cancel</v-icon>
              </template>
            </strong>
            <strong style="font-size: 16px;"> รูปแบบการชำระ : </strong>
            <span style="font-size: 14px;">{{ receiptStore.receipt?.paymentMethod }}   </span>
          </v-col>
        </v-row>
         <!-- 3-->
         <v-row>
          <v-col style="padding-top: 4px;" cols="6" >
            <v-icon color="primary" left style="font-size: 20px;">mdi-account-badge</v-icon>
            <strong style="font-size: 16px;"> พนักงาน : </strong>
            <span style="font-size: 14px;">
              {{ receiptStore.receipt?.user?.userName || 'ไม่มีข้อมูล' }}
            </span>
          </v-col>

          <v-col style="padding-top: 4px;" class="text-right" cols="6" >
            <strong style="font-size: 16px;"> จำนวนเงิน : </strong>
            <span style="font-size: 14px;">{{ receiptStore.receipt?.receiptTotalPrice || 0 }} บาท  </span>
            <strong style="font-size: 16px;">  ส่วนลด : </strong>
            <span style="font-size: 14px;">{{ receiptStore.receipt?.receiptTotalDiscount || 0 }} บาท</span>
          </v-col>
        </v-row>
          <!-- 4-->
           <v-row> <v-col style="padding-top: 4px;" cols="6" >
            <v-icon color="primary" left style="font-size: 20px;">mdi-decagram-outline</v-icon>
            <strong style="font-size: 16px;"> โปรโมชั่น : </strong>
            <span v-if="receiptStore.receipt?.receiptPromotions?.length">
                  <span v-for="promo in receiptStore.receipt?.receiptPromotions" :key="promo.promotion.promotionId">
                    {{ promo.promotion.promotionName }}
                  </span>
                </span>
                <span v-else>-</span>
          </v-col></v-row>
        <v-row>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-table dense class="custom-table">
          <thead>
            <tr>
              <th class="text-center">รายการสินค้า</th>
              <th class="text-center">ระดับความหวาน</th>
              <th class="text-center">ท็อปปิ้ง</th>
              <th class="text-center">จำนวนท็อปปิ้ง</th>
              <th class="text-center">ชนิด</th>
              <th class="text-center">จำนวนต่อหน่วย</th>
              <th class="text-center">ราคา</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!receiptStore.receipt?.receiptItems?.length">
              <td colspan="7" class="text-center">ไม่พบข้อมูล</td>
            </tr>
            <tr v-else v-for="(item, index) in receiptStore.receipt?.receiptItems" :key="index">
              <td class="text-center">{{ item.product?.productName || '-' }}</td>
              <td class="text-center">{{ item.sweetnessLevel ? item.sweetnessLevel + '%' : '0%' }}</td>
              <td class="text-center">
                <template v-if="item.productTypeToppings?.length">
                  <div v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                    {{ topping.topping?.toppingName || '-' }}
                  </div>
                </template>
                <template v-else>-</template>
              </td>
              <td class="text-center">
                <template v-if="item.productTypeToppings?.length">
                  <div v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                    {{ topping.quantity || '0' }}
                  </div>
                </template>
                <template v-else>0</template>
              </td>
              <td class="text-center">{{ item.productType?.productTypeName || '-' }}</td>
              <td class="text-center">{{ item.quantity || '0' }}</td>
              <td class="text-center">{{ item.receiptSubTotal?.toLocaleString() || '0' }}</td>
            </tr>
          </tbody>
        </v-table>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange" @click="closeDialog">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<style scoped>
.v-table-container {
  max-height: 400px; 
  overflow-y: auto;
  margin-top: 16px;
}

.custom-table {
  table-layout: fixed;
  width: 100%;
}

.custom-table th,
.custom-table td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.custom-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.custom-table td {
  background-color: #ffffff;
}

.custom-table ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.custom-table li {
  margin: 0;
  padding: 2px 0;
}

.v-card-title {
  background-color: #f5f5f5;
  padding: 16px;
  font-weight: bold;
}
</style>
