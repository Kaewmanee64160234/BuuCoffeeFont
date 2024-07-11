<!-- 
<template>
  <HistoryReceiptDialog v-model:dialog="historyReceiptDialog" :receipt="selectedReceipt" />
  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="12" style="font-size: 35px;">
            จัดการผู้ใช้งาน
          </v-col>
          <v-row style="margin-left: 6%;">
            <v-col class="pa-2 ma-2" cols="3">
              <v-text-field
                v-model="receiptStore.searchQuery"
                label="ค้นหาคำสั่งซื้อ"
                append-inner-icon="mdi-magnify"
                hide-details
                dense
                @keydown="handleSearchKeydown"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <div class="table-wrapper">
          <v-table class="text-center" style="max-height: 400px; overflow-y: auto;">
            <thead>
              <tr>
                <th class="text-center"></th>
                <th class="text-center">วันที่</th>
                <th class="text-center">ส่วนลด</th>
                <th class="text-center">สมาชิก</th>
                <th class="text-center">โปรโมชั่น</th>
                <th class="text-center">ราคารวมสุทธิ</th>
                <th class="text-center">รูปแบบการจ่ายเงิน</th>
                <th class="text-center">สถานะการจ่ายเงิน</th>
                <th class="text-center">Operations</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="receipt in filteredReceipts" :key="receipt.receiptId">
                <td class="text-center">{{ receipt.receiptId }}</td>
                <td class="text-center">{{ formatDateThai(receipt.createdDate+'') }}</td>
                <td class="text-center">{{ receipt.receiptTotalDiscount }}</td>
                <td class="text-center">{{ receipt.customer?.customerName }}</td>
                <td class="text-center">
                  <span v-for="promo in receipt.receiptPromotions" :key="promo.promotion.promotionId">
                    {{ promo.promotion.promotionName || 'ไม่มีข้อมูล' }}
                  </span>
                </td>
                <td class="text-center">{{ receipt.receiptTotalPrice }}</td>
                <td class="text-center">{{ receipt.paymentMethod }}</td>
                <td class="text-center">{{ receipt.receiptStatus }}</td>
                <td class="text-center">
                  <v-btn color="#FFDD83" icon="mdi-eye" @click="openHistoryReceiptDialog(receipt)"></v-btn>
                </td>
              </tr>
            </tbody>
            <tbody v-if="!filteredReceipts.length">
              <tr>
                <td colspan="12" class="text-center">No data</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </v-card>
  <HistoryReceiptDialog />
</v-container>
</template> -->

<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { computed, onMounted, ref } from 'vue';
import type { Receipt } from '@/types/receipt.type';
import HistoryReceiptDialog from '@/components/receipts/HistoryReceiptDialog.vue';

const receiptStore = useReceiptStore();
const historyReceiptDialog = ref(false);
const selectedReceipt = ref<Receipt | null>(null);

onMounted(async () => {
  await receiptStore.getAllReceipts();
});

const openHistoryReceiptDialog = (receipt: Receipt) => {
  // selectedReceipt.value = receipt;
  receiptStore.receipt = receipt;
 receiptStore.historyReceiptDialog = true;
};

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

const filteredReceipts = computed(() => {
  if (!receiptStore.searchQuery) {
    return receiptStore.receipts.slice().sort((a, b) => (a.receiptId ?? 0) - (b.receiptId ?? 0));
  }
  return receiptStore.receipts
    .filter(receipt =>
      receipt.customer?.customerName?.toLowerCase().includes(receiptStore.searchQuery.toLowerCase()) ||
      receipt.receiptId?.toString().includes(receiptStore.searchQuery)
    )
    .sort((a, b) => (a.receiptId ?? 0) - (b.receiptId ?? 0));
});


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
</script>

<template>
    <HistoryReceiptDialog v-model:dialog="historyReceiptDialog" :receipt="selectedReceipt"></HistoryReceiptDialog>
  
    <v-container>
        <v-card class="flex-container">
          <v-card-title>
            <v-row>
              <v-col cols="12" style="font-size: 35px;">
                จัดการรายการคำสั่งซื้อ
              </v-col>
              <v-row style="margin-left: 6%;">
                <v-col class="pa-2 ma-2" cols="3">
                  <v-text-field
                    v-model="receiptStore.searchQuery"
                    label="ค้นหาคำสั่งซื้อ"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    dense
                    @keydown="handleSearchKeydown"
                  ></v-text-field>
                </v-col>
                
                
                
              </v-row>
              
            </v-row>
            
            <v-spacer> </v-spacer>
          </v-card-title>
          <v-card width="90%" style="margin-left: 5%; margin-top: 3%; overflow-y: auto;">
            <v-table class="text-center">
                <thead>
                    <tr>
                      <th class="text-center"></th>
                      <th class="text-center">วันที่</th>
                      <th class="text-center">ส่วนลด</th>
                      <th class="text-center">สมาชิก</th>
                      <th class="text-center">โปรโมชั่น</th>
                      <th class="text-center">ราคารวมสุทธิ</th>
                      <th class="text-center">รูปแบบการจ่ายเงิน</th>
                      <th class="text-center">สถานะการจ่ายเงิน</th>
                      <th class="text-center">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="receipt in receiptStore.filteredReceipts" :key="receipt.receiptId">
                      <td class="text-center">{{ receipt.receiptId }}</td>
                      <td class="text-center">{{ receipt.createdDate }}</td>
                      <td class="text-center">{{ receipt.receiptTotalDiscount }}</td>
                      <td class="text-center">{{ receipt.customer?.customerName }}</td>
                      <td class="text-center">{{ receipt.promotion }}</td>
                      <td class="text-center">{{ receipt.receiptNetPrice  }}</td>
                      <td class="text-center">{{ receipt.receiptType }}</td>
                      <td class="text-center">{{ receipt.receiptStatus }}</td>
                      <td class="text-center">
                        <v-btn color="#FFDD83" icon="mdi-eye" @click="openHistoryReceiptDialog(receipt)"></v-btn>
                      </td>
                    </tr>
                  </tbody>
              <tbody v-if="!filteredReceipts.length">
                <tr>
                  <td colspan="12" class="text-center">No data</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-card>
      </v-container>
  </template>
  
  
  <style>
  .flex-container {
    display: flex;
    flex-direction: column;
    height: 95vh;
  }
  </style>
  
<!-- =======
  <HistoryReceiptDialog v-model:dialog="historyReceiptDialog" :receipt="selectedReceipt" />

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="9" style="padding: 20px;">
          <h3>ประวัติการขาย</h3>
          </v-col>
          <v-row style="margin-left: 6%;">
            <v-col class="pa-2 ma-2" cols="3">
              <v-text-field
                v-model="receiptStore.searchQuery"
                label="ค้นหาคำสั่งซื้อ"
                append-inner-icon="mdi-magnify"
                hide-details
                dense
                @keydown="handleSearchKeydown"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <v-table class="text-center" style="max-height: 400px; overflow-y: auto;">
          <thead>
            <tr>
              <th class="text-center">ID</th>
              <th class="text-center">วันที่ออกใบเสร็จ</th>
              <th class="text-center">ส่วนลด</th>
              <th class="text-center">สมาชิก</th>
              <th class="text-center">แต้มสะสม</th>
              <th class="text-center">โปรโมชั่น</th>
              <th class="text-center">ราคารวมสุทธิ</th>
              <th class="text-center">รูปแบบการจ่ายเงิน</th>
              <th class="text-center">สถานะการจ่ายเงิน</th>
              <th class="text-center">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="receipt in filteredReceipts" :key="receipt.receiptId">
              <td class="text-center">{{ receipt.receiptId }}</td>
              <td class="text-center">{{ formatDateThai(receipt.createdDate+'') }}</td>
              <td class="text-center">{{ receipt.receiptTotalDiscount }}</td>
              <td class="text-center">
                {{ receipt.customer?.customerName || '-' }}
              </td>
              <td class="text-center">
                {{ receipt.customer?.customerNumberOfStamp || 0 }}
              </td>
              <td class="text-center">
                <span v-if="receipt.receiptPromotions && receipt.receiptPromotions.length > 0">
                  มีการใช้โปรโมชั่น
                </span>
                <span v-else>
                  -
                </span>
              </td>
              <td class="text-center">{{ receipt.receiptTotalPrice }}</td>
              <td class="text-center">{{ receipt.paymentMethod || '-' }}</td>
              <td class="text-center">{{ receipt.receiptStatus }}</td>
              <td class="text-center">
                <v-btn color="#FFDD83" icon="mdi-eye" @click="openHistoryReceiptDialog(receipt)"></v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!filteredReceipts.length">
            <tr>
              <td colspan="12" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}
</style>
>>>>>>> c3c59cc563b64176045566e3f88a8237e36925aa -->
