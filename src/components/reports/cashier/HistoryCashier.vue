<script lang="ts" setup>
import { onMounted } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';

const ReportFinnceStore = useReportFinnceStore();
function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''; // ในกรณีที่ไม่มีวันที่
  const date = new Date(dateString);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'Asia/Bangkok',
    hour12: false
  };
  return date.toLocaleString('th-TH', options);
}


const clearData = () => {
  ReportFinnceStore.createHistoryCashierDialog = false;
};

onMounted(async () => {
  await ReportFinnceStore.getAll();
  console.log(ReportFinnceStore.historycashiers)
});
</script>

<template>
  <v-dialog v-model="ReportFinnceStore.createHistoryCashierDialog" max-width="500px">
    <v-card>
      <v-card-title>
        ประวัติลิ้นชัก
      </v-card-title>
      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th></th>
            <th>วันที่</th>
            <th>จำนวนเงิน</th>
            <th>เวลาการแก้ไข</th>
            <th>ผุ้รับผิดชอบ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ReportFinnceStore.historycashiers" :key="index"
            :class="{ 'red-row': item.deletedAt }">
            <td>{{ index + 1 }}</td>
            <td>{{ formatDate(item.createdDate) }}</td>
            <td>{{ item.cashierAmount }}</td>
            <td :class="{ 'red-cell': item.deletedAt }">{{ formatDate(item.deletedAt) }}</td>
            <td>{{ item.user }}</td>
          </tr>



        </tbody>
        <tbody v-if="!ReportFinnceStore.historycashiers.length">
          <tr>
            <td colspan="9" class="text-center">ไม่มีข้อมูล</td>
          </tr>
        </tbody>
      </v-table>
      <v-card-actions>
        <v-btn @click="clearData">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.red-row {
  color: red;
}

.red-cell {
  color: red;
}

.v-table-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.v-table {
  table-layout: fixed;
  width: 100%;
}

.v-table th,
.v-table td {
  width: 25%;
}

.v-card-title {
  background-color: #f5f5f5;
  padding: 16px;
}

</style>