<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { computed, onMounted, ref, watch } from 'vue';
import type { Receipt } from '@/types/receipt.type';
import { useReceiptsStore } from '@/stores/report/receiptsStore';
import * as XLSX from 'xlsx';
import HistoryReceiptDialog from '@/components/receipts/HistoryReceiptDialog.vue';
import ReceiptOld from '@/components/receipts/ReceiptOld.vue';

// Store initialization
const receiptsStore = useReceiptsStore();
const receiptStore = useReceiptStore();

// Date range setup
const currentDate = new Date();
const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
const startDate = ref(startOfMonth.toISOString().substring(0, 10));
const endDate = ref(endOfMonth.toISOString().substring(0, 10));
const receiptType = ref<string>('ร้านกาแฟ');

// Dialog states
const historyReceiptDialog = ref(false);
const receiptOld = ref(false);
const selectedReceipt = ref<Receipt | null>(null);

// Data fetching
const fetchData = async () => {
  await receiptsStore.fetchReceipts(startDate.value, endDate.value, receiptType.value);
};

// Watch for filter changes
watch([startDate, endDate, receiptType], async () => {
  await fetchData();
}, { deep: true });

// Excel export functionality
const exportToExcel = async () => {
  await fetchData();
  const formattedReceipts = receiptsStore.receipts.map(receipt => ({
    วันที่: formatDate(receipt.createdDate),
    สถานะ: statusText(receipt.receiptStatus),
    'ราคารวมสุทธิ': receipt.receiptNetPrice,
    'ส่วนลด': receipt.receiptTotalDiscount,
    'สมาชิก': receipt.customer?.customerName || '-',
    'โปรโมชั่น': receipt.receiptPromotions?.map(p => p.promotion.promotionName).join(', ') || '-',
    'การชำระเงิน': receipt.paymentMethod,
    'พนักงาน': receipt.user?.userName || '-',
    'ประเภท': receipt.receiptType
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedReceipts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานการขาย');
  
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `รายงานการขาย_${formatDate(new Date().toISOString())}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

// Initialize data on mount
onMounted(async () => {
  await receiptStore.getAllReceipts();
  await receiptStore.getReceiptPaginate();
  await fetchData(); // เพิ่มการโหลดข้อมูลตามฟิลเตอร์เริ่มต้น
});

// Dialog handlers
const openHistoryReceiptDialog = (receipt: Receipt) => {
  receiptStore.receipt = receipt;
  receiptStore.historyReceiptDialog = true;
};

const openOldReceiptDialog = (receipt: Receipt) => {
  selectedReceipt.value = receipt;
  receiptOld.value = true;
};

// Computed properties and utilities
const filteredReceipts = computed(() => {
  const receipts = receiptStore.receipts;
  if (!receipts?.length) return [];
  
  let filtered = [...receipts];

  // กรองตามวันที่
  filtered = filtered.filter(receipt => {
    const receiptDate = new Date(receipt.createdDate || 0);
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    return receiptDate >= start && receiptDate <= end;
  });

  // กรองตามประเภท
  if (receiptType.value !== 'ทั้งหมด') {
    filtered = filtered.filter(receipt => receipt.receiptType === receiptType.value);
  }
  
  // เรียงลำดับตามวันที่
  filtered.sort((a, b) => 
    new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime()
  );
  
  // ค้นหาตามคำค้น
  if (receiptStore.searchQuery) {
    filtered = filtered.filter(receipt => 
      receipt.customer?.customerName?.toLowerCase().includes(receiptStore.searchQuery.toLowerCase()) ||
      receipt.receiptId?.toString().includes(receiptStore.searchQuery)
    );
  }
  
  return filtered;
});

const formatDate = (date: string) => {
  if (!date) return '-';
  const jsDate = new Date(date);
  return jsDate.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  });
};

const statusClass = (status: string) => ({
  'text-success': status === 'paid',
  'text-danger': status === 'cancel'
});

const statusText = (status: string) => {
  const statusMap: Record<string, string> = {
    paid: 'สำเร็จ',
    cancel: 'ยกเลิก'
  };
  return statusMap[status] || status;
};
</script>

<template>
  <ReceiptOld v-model:dialog="receiptOld" :receipt="selectedReceipt" />
  <HistoryReceiptDialog />

  <v-container fluid style="padding-left: 80px">
    <v-card elevation="2" class="pa-4">
      <v-card-title class="d-flex align-center mb-4">
        <h2 class="text-h5 font-weight-bold">ประวัติการขาย</h2>
        <v-spacer />
        <v-btn
          color="success"
          prepend-icon="mdi-file-excel"
          @click="exportToExcel"
          class="ml-2"
        >
          ส่งออก Excel
        </v-btn>
      </v-card-title>

      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="startDate"
            label="วันเริ่มต้น"
            type="date"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="endDate"
            label="วันสิ้นสุด"
            type="date"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-radio-group v-model="receiptType" row class="mt-0">
            <v-radio label="ร้านข้าว" value="ร้านข้าว" />
            <v-radio label="ร้านกาแฟ" value="ร้านกาแฟ" />
            <v-radio label="ทั้งหมด" value="ทั้งหมด" />
          </v-radio-group>
        </v-col>
      </v-row>

      <v-table hover class="elevation-1">
        <thead>
          <tr>
            <th class="text-center">ลำดับ</th>
            <th class="text-center">วันที่</th>
            <th class="text-center">สถานะ</th>
            <th class="text-center">ราคาสุทธิ</th>
            <th class="text-center">ส่วนลด</th>
            <th class="text-center">สมาชิก</th>
            <th class="text-center">โปรโมชั่น</th>
            <th class="text-center">การชำระเงิน</th>
            <th class="text-center">พนักงาน</th>
            <th class="text-center">ประเภท</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(receipt, index) in filteredReceipts"
            :key="receipt.receiptId"
            @click="openHistoryReceiptDialog(receipt)"
            style="cursor: pointer"
          >
            <td class="text-center">{{ index + 1 + (receiptStore.currentPage - 1) * receiptStore.itemsPerPage }}</td>
            <td class="text-center">{{ formatDate(receipt.createdDate) }}</td>
            <td class="text-center" :class="statusClass(receipt.receiptStatus)">
              {{ statusText(receipt.receiptStatus) }}
            </td>
            <td class="text-center">{{ receipt.receiptNetPrice?.toLocaleString() }}</td>
            <td class="text-center">{{ receipt.receiptTotalDiscount?.toLocaleString() }}</td>
            <td class="text-center">{{ receipt.customer?.customerName || '-' }}</td>
            <td class="text-center">
              {{ receipt.receiptPromotions?.map(p => p.promotion.promotionName).join(', ') || '-' }}
            </td>
            <td class="text-center">{{ receipt.paymentMethod }}</td>
            <td class="text-center">{{ receipt.user?.userName }}</td>
            <td class="text-center">{{ receipt.receiptType }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-center mt-4">
        <v-pagination
          v-model="receiptStore.currentPage"
          :length="Math.ceil(receiptStore.totalReceipts / receiptStore.itemsPerPage)"
          @update:model-value="receiptStore.getReceiptPaginate"
          rounded="circle"
        />
      </div>
    </v-card>
  </v-container>
</template>
