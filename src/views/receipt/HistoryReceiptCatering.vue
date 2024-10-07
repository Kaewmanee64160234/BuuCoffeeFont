<script lang="ts" setup>
import { useReceiptStore } from '@/stores/receipt.store';
import { useReceiptsStore } from '@/stores/report/receiptsStore';
import { computed} from 'vue';

const receiptsStore = useReceiptsStore();
const receiptStore = useReceiptStore();

const paginatedReceipts = computed(() => {
  const start = (receiptStore.currentPage - 1) * receiptStore.itemsPerPage;
  const end = start + receiptStore.itemsPerPage;
  return filteredReceipts.value.slice(start, end);
});

const filteredReceipts = computed(() => {
  if (!receiptStore.searchQuery) {
    return receiptStore.receipts.slice().sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }
  return receiptStore.receipts.filter(receipt =>
    receipt.customer?.customerName?.toLowerCase().includes(receiptStore.searchQuery.toLowerCase()) ||
    receipt.receiptId?.toString().includes(receiptStore.searchQuery)
  ).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
});
</script>

<template>
  <!-- <dialogImportItemCateringHistory v-model:dialog="historyCheckDialog" :checkingredient="selectedCheck" /> -->
  <v-container>

    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9"> จัดเลี้ยงรับรอง </v-col>
          <v-col cols="3">
            <v-text-field variant="solo" label="ค้นหาประวัติการเช็ควัตถุดิบ" append-inner-icon="mdi-magnify"
              hide-details dense></v-text-field>
          </v-col>
        </v-row>

      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th style="text-align: center; font-weight: bold">
              ชื่อการจัดเลี้ยง
            </th>
            <th style="text-align: center; font-weight: bold">วันที่จัดเลี้ยง</th>
            <th style="text-align: center; font-weight: bold">สถานที่จัดเลี้ยง</th>
            <th style="text-align: center; font-weight: bold">จำนวนคน</th>
            <th style="text-align: center; font-weight: bold">งบประมาณ</th>
            <th style="text-align: center; font-weight: bold">สถานะ</th>
            <th style="text-align: center; font-weight: bold">ผู้รับผิดชอบ</th>
            <th style="text-align: center; font-weight: bold">แอคชั่น</th>
          </tr>
        </thead>
        <tbody>
         
        </tbody>
       

        <!-- :length="subIngredientStore.lastPage" -->
      </v-table>

    </v-card>
  </v-container>
  <v-pagination
  v-model="receiptStore.currentPage"
  :length="Math.ceil(filteredReceipts.length / receiptStore.itemsPerPage)"
  rounded="circle"
></v-pagination>
</template>

<style scoped>
.red-text {
  color: red;
}

.yellow-text {
  color: #0d78f3;
}

.button-full-width {
  width: 100%;
}

th,
td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  text-align: center !important;
}

/* Responsive styles */
@media (max-width: 1024px) {

  th,
  td {
    font-size: 14px;
    padding: 8px;
  }

  .button-full-width {
    font-size: 14px;
  }
}

@media (max-width: 768px) {

  th,
  td {
    font-size: 12px;
    padding: 6px;
  }

  .button-full-width {
    font-size: 12px;
  }
}

@media (max-width: 480px) {

  th,
  td {
    font-size: 10px;
    padding: 4px;
  }

  .button-full-width {
    font-size: 10px;
  }

  th,
  td {
    white-space: nowrap;
  }

  v-container {
    padding: 0;
    /* ลด padding ของ container */
  }

  v-card {
    margin: 0;
    /* ลด margin ของ card */
  }
}
</style>
