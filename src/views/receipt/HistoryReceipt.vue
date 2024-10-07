<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { computed, onMounted, ref } from 'vue';
import type { Receipt } from '@/types/receipt.type';
import { useReceiptsStore } from '@/stores/report/receiptsStore';
import * as XLSX from 'xlsx';
import HistoryReceiptDialog from '@/components/receipts/HistoryReceiptDialog.vue';
import ReceiptOld from '@/components/receipts/ReceiptOld.vue';

const receiptsStore = useReceiptsStore();
const receiptStore = useReceiptStore();

// Date Range Setup
const currentDate = new Date();
const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
const startDate = ref(startOfMonth.toISOString().substring(0, 10));
const endDate = ref(endOfMonth.toISOString().substring(0, 10));
const receiptType = ref<string>('ร้านกาแฟ');

// Dialog Management
const historyReceiptDialog = ref(false);
const receiptOld = ref(false);
const selectedReceipt = ref<Receipt | null>(null);

// Fetching data for receipts
const fetchData = async () => {
  await receiptsStore.fetchReceipts(startDate.value, endDate.value, receiptType.value);
};

// Export receipts to Excel
const exportToExcel = async () => {
  await fetchData();
  const formattedReceipts = formatReceiptsForExcel(receiptsStore.receipts);
  const worksheet = XLSX.utils.json_to_sheet(formattedReceipts, {
    header: [
      'ราคารวม', 'ส่วนลดรวม', 'ราคารวมสุทธิ', 'สถานะรายการ', 'รูปแบบร้าน', 'เลขคิว', 'รูปแบบชำระเงิน',
      'วันที่สร้าง', 'วันที่แก้ไข', 'รายการที่สั่งซื้อ', 'พนักงาน', 'ลูกค้า', 'โปรโมชันที่ใช้',
    ]
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts');

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'receipts.xlsx';
  link.click();
};

// Utility function for converting string to binary
const s2ab = (s: string) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
};

// Lifecycle Hook - Fetch Receipts on Mount
onMounted(async () => {
  await receiptStore.getAllReceipts();
});

// Open the receipt detail dialog
const openHistoryReceiptDialog = (receipt: Receipt) => {
  selectedReceipt.value = receipt;
  historyReceiptDialog.value = true;
};

// Open the old receipt dialog
const openOldReceiptDialog = (receipt: Receipt) => {
  selectedReceipt.value = receipt;
  receiptOld.value = true;
};

// Filter receipts based on search query
const filteredReceipts = computed(() => {
  if (!receiptStore.searchQuery) {
    return receiptStore.receipts.slice().sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }
  return receiptStore.receipts.filter(receipt =>
    receipt.customer?.customerName?.toLowerCase().includes(receiptStore.searchQuery.toLowerCase()) ||
    receipt.receiptId?.toString().includes(receiptStore.searchQuery)
  ).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
});

// Format the date for display
const formatDate = (date: string) => {
  const jsDate = new Date(date);
  return jsDate.toLocaleDateString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Bangkok'
  }) + ' เวลา ' + jsDate.toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
  });
};

// Format receipts for Excel export
const formatReceiptsForExcel = (receipts: Receipt[]) => {
  return receipts.flatMap(receipt => {
    return receipt.receiptItems.map(item => ({
      receiptTotalPrice: receipt.receiptTotalPrice,
      receiptTotalDiscount: receipt.receiptTotalDiscount,
      receiptNetPrice: receipt.receiptNetPrice,
      receiptStatus: receipt.receiptStatus,
      receiptType: receipt.receiptType,
      queueNumber: receipt.queueNumber,
      paymentMethod: receipt.paymentMethod,
      createdDate: receipt.createdDate,
      updatedDate: receipt.updatedDate,
      quantity: item.quantity,
      receiptSubTotal: item.receiptSubTotal,
      sweetnessLevel: item.sweetnessLevel,
      productTypeName: item.productType.productTypeName,
      productName: item.product.productName,
      productPrice: item.product.productPrice,
      categoryName: item.product.category.categoryName,
      userName: receipt.user?.userName,
      customer: receipt.customer?.customerName,
      discount: receipt.receiptPromotions.map(promo => promo.discount).join(', '),
      promotionNames: receipt.receiptPromotions.map(promo => promo.promotion.promotionName).join(', ')
    }));
  });
};

// Receipt status display logic
const statusClass = (status: string) => ({
  'text-success': status === 'paid',
  'text-danger': status === 'cancel',
});

const statusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'สำเร็จ';
    case 'cancel':
      return 'ยกเลิก';
    default:
      return status;
  }
};
</script>

<template>
  <ReceiptOld v-model:dialog="receiptOld" :receipt="selectedReceipt" />
  <HistoryReceiptDialog v-model:dialog="historyReceiptDialog" :receipt="selectedReceipt" />

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="12" md="4" style="padding: 20px;">
            <h3>ประวัติการขาย</h3>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="startDate" label="วันเริ่ม" type="date" outlined dense hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="endDate" label="วันสิ้นสุด" type="date" outlined dense hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-radio-group v-model="receiptType" row>
              <v-radio label="ร้านข้าว" value="ร้านข้าว"></v-radio>
              <v-radio label="ร้านกาแฟ" value="ร้านกาแฟ"></v-radio>
              <v-radio label="ทั้งหมด" value="ทั้งหมด"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn @click="exportToExcel" color="success">
              <v-icon color="white" style="font-size: 20px;">mdi-file-excel</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th class="text-center">#</th>
            <th class="text-center">วันที่ออกใบเสร็จ</th>
            <th class="text-center">สถานะใบเสร็จ</th>
            <th class="text-center">ราคารวมสุทธิ</th>
            <th class="text-center">ส่วนลด</th>
            <th class="text-center">สมาชิก</th>
            <th class="text-center">โปรโมชั่น</th>
            <th class="text-center">รูปแบบการจ่ายเงิน</th>
            <th class="text-center">พนักงาน</th>
            <th class="text-center">ประเภทใบเสร็จ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(receipt, index) in filteredReceipts" :key="receipt.receiptId" @click="openHistoryReceiptDialog(receipt)">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-center">{{ formatDate(receipt.createdDate) }}</td>
            <td :class="statusClass(receipt.receiptStatus)" class="text-center">{{ statusText(receipt.receiptStatus) }}</td>
            <td class="text-center">{{ receipt.receiptNetPrice }}</td>
            <td class="text-center">{{ receipt.receiptTotalDiscount }}</td>
            <td class="text-center">{{ receipt.customer?.customerName }}</td>
            <td class="text-center">{{ receipt.receiptPromotions.map(promo => promo.promotion.promotionName).join(', ') }}</td>
            <td class="text-center">{{ receipt.paymentMethod }}</td>
            <td class="text-center">{{ receipt.user?.userName }}</td>
            <td class="text-center">{{ receipt.receiptType }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
