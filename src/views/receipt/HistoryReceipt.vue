<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { computed, onMounted, ref } from 'vue';
import type { Receipt } from '@/types/receipt.type';
import { useReceiptsStore } from '@/stores/report/receiptsStore';
import * as XLSX from 'xlsx';
import HistoryReceiptDialog from '@/components/receipts/HistoryReceiptDialog.vue';
import ReceiptOld from '@/components/receipts/ReceiptOld.vue';
const receiptsStore = useReceiptsStore();
const currentDate = new Date();
const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const startDate = ref(startOfMonth.toISOString().substring(0, 10));
const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
const endDate = ref(endOfMonth.toISOString().substring(0, 10));
const receiptType = ref<string>('ร้านกาแฟ');
const receiptStore = useReceiptStore();
const historyReceiptDialog = ref(false);
const receiptOld = ref(false);
const selectedReceipt = ref<Receipt | null>(null);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);

const totalPages = computed(() => {
  return Math.ceil(filteredReceipts.value.length / itemsPerPage.value);
});

const paginatedReceipts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReceipts.value.slice(start, end);
});

const fetchData = async () => {
  await receiptsStore.fetchReceipts(startDate.value, endDate.value, receiptType.value);
};

const exportToExcel = async () => {
  await fetchData();
  const formattedReceipts = formatReceiptsForExcel(receiptsStore.receipts);
  const worksheet = XLSX.utils.json_to_sheet(formattedReceipts, {
    header: [
      'ราคารวม',
      'ส่วนลดรวม',
      'ราคารวมสุทธิ',
      'สถานะรายการ',
      'รูปแบบร้าน',
      'เลขคิว',
      'รูปแบบชำระเงิน',
      'วันที่สร้าง',
      'วันที่แก้ไข',
      'รายการที่สั่งซื้อ',
      'พนักงาน',
      'ลูกค้า',
      'โปรโมชั้นที่ใช้',
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


const s2ab = (s: string) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
};

onMounted(async () => {
  await receiptStore.getAllReceipts();
});

const openHistoryReceiptDialog = (receipt: Receipt) => {
  receiptStore.receipt = receipt;
  receiptStore.historyReceiptDialog = true;
};
const openOldReceiptDialog = (receipt: Receipt) => {
  receiptStore.receipt = receipt;
  receiptStore.receiptOld = true;
};
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

const filteredReceipts = computed(() => {
  if (!receiptStore.searchQuery) {
    return receiptStore.receipts.slice().sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }
  return receiptStore.receipts
    .filter(receipt =>
      receipt.customer?.customerName?.toLowerCase().includes(receiptStore.searchQuery.toLowerCase()) ||
      receipt.receiptId?.toString().includes(receiptStore.searchQuery)
    )
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
});


const formatDate = (date: any) => {
  if (!date) return '';

  const jsDate = new Date(date.toString());
  const formattedDate = jsDate.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  });

  const formattedTime = jsDate.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  });

  return `${formattedDate} เวลา ${formattedTime}`;
};

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
      customer: receipt.customer,
      discount: receipt.receiptPromotions.map(promo => promo.discount).join(', '),
      promotionNames: receipt.receiptPromotions.map(promo => promo.promotion.promotionName).join(', ')
    }));
  });
};

const statusClass = (status: string) => {
  return {
    'text-success': status === 'paid',
    'text-danger': status === 'cancel'
  };
};

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

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

.text-success {
  color: #4caf50;
}

.text-danger {
  color: #f44336;
}

.table-container {
  max-height: 70vh;
  overflow-y: auto;
  margin-left: 2%;
  margin-top: 3%;
}

/* Responsive styles */
@media (max-width: 768px) {

  .v-table th,
  .v-table td {
    font-size: 12px;
  }

  .flex-container {
    padding: 10px;
  }
}

@media (max-width: 480px) {

  .v-table th,
  .v-table td {
    font-size: 10px;
  }

  .flex-container {
    padding: 5px;
  }
}
</style>


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
      <v-text-field 
        v-model="startDate" 
        label="วันเริ่ม" 
        type="date" 
        outlined 
        dense 
        hide-details 
        variant="solo"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4">
      <v-text-field 
        v-model="endDate" 
        label="วันสิ้นสุด" 
        type="date" 
        outlined 
        dense 
        hide-details 
        variant="solo"
      ></v-text-field>
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
            <th class="text-center font-weight: bold;"></th>
            <th class="text-center font-weight: bold;">วันที่ออกใบเสร็จ</th>
            <th class="text-center font-weight: bold;">สถานะใบเสร็จ</th>
            <th class="text-center font-weight: bold;">ราคารวมสุทธิ</th>
            <th class="text-center font-weight: bold;">ส่วนลด</th>
            <th class="text-center font-weight: bold;">สมาชิก</th>
            <th class="text-center">โปรโมชั่น</th>
            <th class="text-center">รูปแบบการจ่ายเงิน</th>
            <th class="text-center">พนักงาน</th>
            <th class="text-center">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(receipt, index) in paginatedReceipts" :key="receipt.receiptId">
            <td class="text-center">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
            <td class="text-center">{{ formatDate(receipt.createdDate + '') }}</td>
            <td class="text-center">
              <span :class="statusClass(receipt.receiptStatus)">
                {{ statusText(receipt.receiptStatus) }}
              </span>
            </td>
            <td class="text-center">{{ receipt.receiptNetPrice }}</td>
            <td class="text-center">{{ receipt.receiptTotalDiscount }}</td>
            <td class="text-center">{{ receipt.customer?.customerName || '-' }}</td>
            <td class="text-center">
              <span v-if="receipt.receiptPromotions && receipt.receiptPromotions.length > 0">
                มีการใช้โปรโมชั่น
              </span>
              <span v-else>
                -
              </span>
            </td>
            <td class="text-center">{{ receipt.paymentMethod || '-' }}</td>
            <td class="text-center">{{ receipt.user?.userName }}</td>
            <td class="text-center">
              <v-btn color="#ed8731 " class="mr-2" icon="mdi-pencil" @click="openHistoryReceiptDialog(receipt)"><v-icon
                  color="white" style="font-size: 20px;">mdi-eye-circle</v-icon></v-btn>
              <v-btn color="#4CAF50 " class="mr-2" icon="mdi-pencil" @click="openOldReceiptDialog(receipt)"><v-icon
                  color="white" style="font-size: 20px;">mdi-receipt-text-outline</v-icon></v-btn>
              <!-- <v-btn color="#4CAF50 " class="mr-2" icon="mdi-pencil"
                                @click="openOldReceiptDialog(receipt)"><v-icon color="white"
                                    style="font-size: 20px;">mdi-file-excel</v-icon></v-btn> -->

            </td>

          </tr>
          <tr v-if="!paginatedReceipts.length">
            <td colspan="10" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination Controls -->
      <v-row justify="center" class="mt-4">
        <v-pagination v-model="currentPage" :length="totalPages" total-visible="7"></v-pagination>
      </v-row>
    </v-card>
  </v-container>
</template>
