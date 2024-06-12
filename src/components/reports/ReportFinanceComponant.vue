<script lang="ts" setup>
import { ref,onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import CreateDialogAddCashier from '../../components/reports/cashier/DialogAddCashier.vue';
import CreateHistoryDialogCashier from '../../components/reports/cashier/HistoryCashier.vue';
const ReportFinnceStore = useReportFinnceStore();
onMounted(async () => {
  await ReportFinnceStore.getfindToday();
  await ReportFinnceStore.getSumType();
  updateChartData();
});
const chartOptions = ref({
  chart: {
    type: 'donut'
  },
  labels: ['เงินสด', 'พร้อมเพย์'],
  colors: ['#FF6384', '#36A2EB'],
  legend: {
    position: 'right'
  },
  dataLabels: {
    enabled: false
  }
});

const chartSeries = ref([0, 0]);
const updateChartData = () => {
  const cashAmount = parseInt(ReportFinnceStore.sumType.cash) || 0;
  const qrCodeAmount = parseInt(ReportFinnceStore.sumType.qrcode) || 0;
  chartSeries.value = [cashAmount, qrCodeAmount];
};


const openCreateDialog = () => {
    ReportFinnceStore.createCashierDialog = true;
};
const openHistoryDialog = () => {
    ReportFinnceStore.createHistoryCashierDialog = true;
};
const deleteCashier = async (id: number) => {
    try {
        await ReportFinnceStore.deleteCashier(id);
        await ReportFinnceStore.getfindToday(); 
        emit('reloadData');
    } catch (error) {
        console.error(error);
    }
};
</script>

<template>
    <CreateDialogAddCashier/>
    <CreateHistoryDialogCashier/>
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
          <apexchart type="donut" :options="chartOptions" :series="chartSeries"></apexchart>
        </v-card>
        </v-col>
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  เงินในลิ้นชัก
                  <v-btn icon>
                    <v-icon @click="openHistoryDialog">mdi-eye</v-icon>
                  </v-btn>
                </v-card-title>
                <template v-if="ReportFinnceStore.cashiers !== null && Object.keys(ReportFinnceStore.cashiers).length !== 0">
    <v-card-subtitle>
        เงินต้น : {{ ReportFinnceStore.cashiers.cashierAmount }} 
        <span @click="deleteCashier(ReportFinnceStore.cashiers.cashierId)">
            <v-icon>mdi-delete</v-icon>
        </span>
    </v-card-subtitle>
</template>

<template v-else>
    <v-btn @click="openCreateDialog">กรอกจำนวนเงินวันนี้</v-btn>
</template>

                <v-card-subtitle>ปัจจุบัน : 1,400</v-card-subtitle>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  รายได้
                  <v-btn icon>
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-subtitle class="text-h4">3,000.00</v-card-subtitle>
                <v-card-actions>
                  <v-btn block>กรอกจำนวนเงินวันนี้</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  จำนวนรายการ
                  <v-btn icon>
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-subtitle class="text-h4">45</v-card-subtitle>
                <v-card-actions>
                  <v-btn block>กรอกจำนวนเงินวันนี้</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                  ส่วนลด
                  <v-btn icon>
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-subtitle class="text-h4">300</v-card-subtitle>
                <v-card-actions>
                  <v-btn block>กรอกจำนวนเงินวันนี้</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </template>

<style scoped>
v-card {
  padding: 16px;
}
</style>
