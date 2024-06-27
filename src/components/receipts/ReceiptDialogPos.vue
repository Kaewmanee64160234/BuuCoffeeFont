<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { computed, onMounted, ref } from 'vue';
import type { Receipt } from '@/types/receipt.type';
import { usePosStore } from '@/stores/pos.store';
import HistoryReceiptDialog from '@/components/receipts/HistoryReceiptDialog.vue';
import Swal from 'sweetalert2';

const receiptStore = useReceiptStore();
const posStore = usePosStore();


onMounted(async () => {
  await receiptStore.getRecieptIn30Min();
});

const cancelReceipt = async (receipt:Receipt) => {
  // dialog close
  posStore.ReceiptDialogPos = false;
  await Swal.fire({
    title: 'ยืนยันการยกเลิกคำสั่งซื้อ?',
    text: 'คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    didOpen: () => {
      // Increase z-index of the popup and its backdrop
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.zIndex = '2000';
      }
      
      
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      const response = await receiptStore.cancelReceipt(receipt.receiptId!);
      if (response) {
        Swal.fire('ยกเลิกคำสั่งซื้อสำเร็จ', '', 'success');
        posStore.ReceiptDialogPos = false;
      } else {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถยกเลิกคำสั่งซื้อได้', 'error');
      }
    }
  });
  posStore.ReceiptDialogPos = true;

};
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Optionally, you could trigger search here if needed
  }
};

// set receipt selected to pos
const selectReceipt = (receipt:Receipt) => {
  posStore.receipt = receipt;
  posStore.selectedItems = receipt.receiptItems; // assuming items is an array of the selected receipt items
  posStore.ReceiptDialogPos = false;
  console.log('Selected Receipt:', receipt);
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
  <v-dialog v-model="posStore.ReceiptDialogPos" max-width="70%" max-height="70%">
    <v-card class="flex-container">
      <v-card-title class="d-flex justify-space-between align-center">
        <span style="font-size: 35px;">ค้นหาคำสั่งซื้อ</span>
        <v-btn icon @click="posStore.ReceiptDialogPos = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        <v-row justify="start">
          <v-col cols="12" md="6" lg="4">
            <v-text-field v-model="receiptStore.searchQuery" label="ค้นหาคำสั่งซื้อ" append-inner-icon="mdi-magnify"
              hide-details dense @keydown="handleSearchKeydown"></v-text-field>
          </v-col>
        </v-row>
      </v-card-subtitle>
      <v-card class="flex-grow-1 overflow-y-auto mt-4">
        <v-table class="text-center">
          <thead>
            <tr>
              <th class="text-center">ID</th>
              <th class="text-center">วันที่ออกใบเสร็จ</th>
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
              <td class="text-center">{{ formatDateThai(receipt.createdDate + '') }}</td>
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
              <td class="text-center">{{ receipt.receiptTotalPrice }}</td>
              <td class="text-center">{{ receipt.paymentMethod || '-' }}</td>
              <td class="text-center">{{ receipt.receiptStatus }}</td>
              <td class="text-center">
                <v-btn color="yellow" class="mr-2" icon="mdi-pencil" @click="selectReceipt(receipt)"></v-btn>
                <v-btn color="red" icon="mdi-delete" @click="cancelReceipt(receipt)"></v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!filteredReceipts.length">
            <tr>
              <td colspan="10" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-card>
  </v-dialog>
</template>



<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

.z-index-high {
  z-index: 2000000 ;
}
</style>