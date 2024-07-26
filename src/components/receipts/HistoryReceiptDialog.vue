<template>
  <v-dialog v-model="reciptStore.historyReceiptDialog" max-width="1090px">
    <v-card>
      <v-card-title>
  <!-- First Row: Date and Status -->
  <v-row>
    <v-col cols="6">
      <span >
        บันทึกการสั่งซื้อ วันที่ {{ reciptStore.receipt?.createdDate }}
      </span>
    </v-col>
    <v-col cols="6" class="text-right">
     

      <span v-if="reciptStore.receipt?.receiptStatus === 'cancel'">
        เวลาที่ยกเลิก : {{ reciptStore.receipt?.updatedDate }}
      </span>
    </v-col>
  </v-row>

  <!-- Second Row: Customer and Cancellation Time -->
  <v-row>
    <v-col cols="6">
      <span>
        ลูกค้า : {{ reciptStore.receipt?.customer?.customerName || 'ไม่มีข้อมูล' }}
      </span>
    </v-col>
    <v-col cols="6" class="text-right">
      <span >
        สถานะ : 
        <template v-if="reciptStore.receipt?.receiptStatus === 'paid'">
          {{ reciptStore.receipt?.receiptStatus }} <v-icon>mdi-check</v-icon>
        </template>
        <template v-if="reciptStore.receipt?.receiptStatus === 'cancel'">
          {{ reciptStore.receipt?.receiptStatus }} <v-icon>mdi-cancel</v-icon>
        </template>
      </span>
    </v-col>
  </v-row>
</v-card-title>
      <v-card-text>
        <v-container>
          <v-table dense>
            <thead>
              <tr>
                <th class="text-center">รายการสินค้า</th>
                <th class="text-center">ระดับความหวาน</th>
                <th class="text-center">ท็อปปิ้ง</th>
                <th class="text-center">จำนวนท็อปปิ้ง</th>
                <th class="text-center">ชนิด</th>
                <th class="text-center">จำนวนต่อหน่วย</th>
                <th class="text-center">ราคา</th>
                <th class="text-center">โปรโมชั่นที่ใช้</th>
                <th class="text-center">พนักงานที่ออกใบเสร็จ</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in reciptStore.receipt?.receiptItems" :key="index">
                <td class="text-center">{{ item.product?.productName }}</td>

                <td class="text-center">
                  {{ item.sweetnessLevel ? item.sweetnessLevel + '%' : '0%' }}
                </td>
                
                <td class="text-center">
                  <ul>
                    <li v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                      <span v-if="topping.topping?.toppingName">{{ topping.topping.toppingName }}</span>
                      <span v-else>-</span>
                    </li>
                    <li v-if="item.productTypeToppings.length === 0">-</li>
                  </ul>
                </td>

                <td class="text-center">
                  <ul>
                    <li v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                      {{ topping.quantity || '0' }}
                    </li>
                    <li v-if="item.productTypeToppings.length === 0">0</li>
                  </ul>
                </td>

                <td class="text-center">
                  <span v-if="item.productType?.productTypeName">
                    {{ item.productType.productTypeName }}
                  </span>
                  <span v-else>
                    ไม่มีข้อมูล
                  </span>
                </td>

                <td class="text-center">{{ item.quantity }}</td>

                <td class="text-center">{{ item.receiptSubTotal }}</td>


                <td class="text-center">
                  <span v-if="reciptStore.receipt?.receiptPromotions?.length">
                    <span v-for="promo in reciptStore.receipt?.receiptPromotions" :key="promo.promotion.promotionId">
                      {{ promo.promotion.promotionName }}
                    </span>
                  </span>
                  <span v-else>
                    -
                  </span>
                </td>

                <td class="text-center">
                  {{ reciptStore.receipt?.user?.userName || '-' }}
                </td>
              </tr>
            </tbody>
          </v-table>
          <div class="text-right" style="margin-top: 20px;">
            <strong>ราคารวมสุทธิ</strong>
            <span>{{ reciptStore.receipt?.receiptTotalPrice || 0 }} บาท</span>
          </div>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange" @click="closeDialog">ตกลง</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useReceiptStore } from '@/stores/receipt.store';

const reciptStore = useReceiptStore()

function formatDateThai(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert AD to BE
  return `${day} ${month} พ.ศ.${year}`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

const formattedReceiptDate = computed(() => {
  return reciptStore.receipt ? formatDateThai(new Date(reciptStore.receipt.createdDate).toISOString()) : '';
});

const formattedReceiptTime = computed(() => {
  return reciptStore.receipt ? formatTime(new Date(reciptStore.receipt.createdDate).toISOString()) : '';
});

function closeDialog() {
  reciptStore.receipt = null;
  reciptStore.historyReceiptDialog = false;
}
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
