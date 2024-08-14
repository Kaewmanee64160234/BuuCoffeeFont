<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { computed, onMounted, ref } from 'vue';
import type { Receipt } from '@/types/receipt.type';
import { useReceiptsStore } from '@/stores/report/receiptsStore';
import * as XLSX from 'xlsx';
import HistoryReceiptDialogCatering from '@/components/receipts/HistoryReceiptDialogCatering.vue';
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';
import { usePosStore } from '@/stores/pos.store';

const receiptsStore = useReceiptsStore();
const startDate = ref('');
const endDate = ref('');
const receiptType = ref<string>('ร้านจัดเลี้ยง');
const receiptStore = useReceiptStore();
const ingredientStore = useCheckIngredientStore();

const historyReceiptDialog = ref(false);
const editDialog = ref(false); // New ref for edit dialog
const posStore = usePosStore();

const fetchData = async () => {
  await receiptsStore.fetchReceipts(startDate.value, endDate.value, receiptType.value);
};

const exportToExcel = () => {
  fetchData();
  const formattedReceipts = formatReceiptsForExcel(receiptsStore.receipts);
  const worksheet = XLSX.utils.json_to_sheet(formattedReceipts, {
    header: [
      'receiptTotalPrice',
      'receiptTotalDiscount',
      'receiptNetPrice',
      'receiptStatus',
      'receiptType',
      'queueNumber',
      'paymentMethod',
      'createdDate',
      'updatedDate',
      'receiptItems',
      'userName',
      'customer',
      'receiptPromotions',
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

const receipts = receiptsStore.receipts;

onMounted(async () => {
  await receiptStore.getAllReceipts();
});

const openHistoryReceiptDialog = async (receipt: Receipt) => {
  receiptStore.receipt = receipt;
  await ingredientStore.getHistoryCheckById(receiptStore.receipt?.checkIngredientId!);

  receiptStore.historyReceiptDialogCatering = true;
};

const openEditDialog = (receipt: Receipt) => {
  posStore.receipt = { ...receipt };
  editDialog.value = true;
};

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

const filteredReceipts = computed(() => {
  const typeFilter = 'ร้านจัดเลี้ยง';

  // Filter receipts based on the receiptType being 'ร้านจัดเลี้ยง'
  const filteredByType = receiptStore.receipts.filter(
    (receipt) => receipt.receiptType === typeFilter
  );

  // Further filter based on searchQuery if provided
  if (!receiptStore.searchQuery) {
    return filteredByType.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }

  return filteredByType
    .filter(receipt =>
      receipt.customer?.customerName?.toLowerCase().includes(receiptStore.searchQuery.toLowerCase()) ||
      receipt.receiptId?.toString().includes(receiptStore.searchQuery)
    )
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
});

const formatDate = (date: any) => {
  if (!date) return ''; // Handle case where date is not provided

  const jsDate = new Date(date.toString()); // Convert date to string and create Date object
  const formattedDate = jsDate.toLocaleDateString('th-TH', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    timeZone: 'Asia/Bangkok' 
  }); // Format the date in the desired format
  
  const formattedTime = jsDate.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  }); // Format the time in the desired format
  
  return `${formattedDate} เวลา ${formattedTime}`; // Combine date and time
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
    'text-danger': status === 'cancel',
    'text-warning': status === 'unpaid',
  };
};

const statusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'สำเร็จ';
    case 'cancel':
      return 'ยกเลิก';
    case 'unpaid':
      return 'รอการดำเนินการ';
    default:
      return status;
  }
};

// Update change amount based on receive and net price
const updateChange = () => {
  if (posStore.receipt) {
    posStore.receipt.change = posStore.receipt.receive - posStore.receipt.receiptNetPrice;
  }
};

// Save the changes made in the edit dialog
const saveChanges = async () => {
  if (posStore.receipt) {
    // Call the update function in your store or API to save the changes
    await posStore.updateReceiptCatering(posStore.receipt.receiptId, posStore.receipt);

    // Close the dialog and refresh the data
    closeEditDialog();
    await receiptStore.getAllReceipts();
  }
};

const closeEditDialog = () => {
  editDialog.value = false;
  posStore.receipt = null;
};

</script>

<template>
  <HistoryReceiptDialogCatering v-model:dialog="historyReceiptDialog" />

  <!-- Edit Receipt Dialog -->
  <v-dialog v-model="editDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span>แก้ไขใบเสร็จ</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-text-field
            v-model="posStore.receipt.receive"
            label="จำนวนเงินที่ได้รับ"
            type="number"
            @input="updateChange"
            outlined
            dense
          />
          <v-text-field
            v-model="posStore.receipt.change"
            label="เงินทอน"
            type="number"
            readonly
            outlined
            dense
          />
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="saveChanges">บันทึก</v-btn>
        <v-btn color="secondary" @click="closeEditDialog">ยกเลิก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="9" style="padding: 20px;">
            <h3>ประวัติการขาย (ร้านจัดเลี้ยง)</h3>
          </v-col>
          <v-row>
            <v-col cols="12" md="4" style="margin-left: 1%;">
              <v-text-field
                v-model="startDate"
                label="Start Date"
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
                label="End Date"
                type="date"
                outlined
                dense
                hide-details
                variant="solo"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mt-4 mr-2" justify="end">
            <v-btn @click="fetchData" color="primary" class="mr-2">
              โหลดข้อมูล
            </v-btn>
            <v-btn @click="exportToExcel" color="success">
              Export to Excel
            </v-btn>
          </v-row>
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
          <tr v-for="(receipt, index) in filteredReceipts" :key="receipt.receiptId">
            <td class="text-center">{{ index + 1 }}</td>
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
              <span v-else>-</span>
            </td>
            <td class="text-center">{{ receipt.paymentMethod || '-' }}</td>
            <td class="text-center">{{ receipt.user?.userName }}</td>
            <td class="text-center">
              <v-btn
                v-if="receipt.receiptStatus !== 'paid'"
                color="#FFDD83"
                icon="mdi-pencil"
                @click="openEditDialog(receipt)"
              ></v-btn>
              <v-btn color="#FFDD83" icon="mdi-eye" @click="openHistoryReceiptDialog(receipt)"></v-btn>
            </td>
          </tr>
          <tr v-if="!filteredReceipts.length">
            <td colspan="10" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>



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
</style>
