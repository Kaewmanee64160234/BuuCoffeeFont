<script lang="ts" setup>
import { ref, onMounted ,computed} from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import CreateDialogAddCashier from '../../components/reports/cashier/DialogAddCashier.vue';
import CreateHistoryDialogCashier from '../../components/reports/cashier/HistoryCashier.vue';

const ReportFinnceStore = useReportFinnceStore();

const chartSeries = ref([0, 0]);
const chartOptions = ref({
  chart: {
    type: 'donut',
    animations: {
      enabled: true,
    },
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

const updateChartData = () => {
  const cashAmount = parseInt(ReportFinnceStore.sumType.cash) || 0;
  const qrCodeAmount = parseInt(ReportFinnceStore.sumType.qrcode) || 0;
  chartSeries.value = [cashAmount, qrCodeAmount];
};

onMounted(async () => {
  await ReportFinnceStore.getfindToday();
  await ReportFinnceStore.getSumType();
  await ReportFinnceStore.getDailyReport();
  updateChartData();
});
const cash = parseFloat(ReportFinnceStore.sumType.cash);
const cashier = ReportFinnceStore.cashiers;
const start = cashier ? parseFloat(cashier.cashierAmount) : undefined;
const sum = (cash || 0) + (start || 0);
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
    updateChartData();
  } catch (error) {
    console.error(error);
  }
};

const lineChartOptions = ref({ 
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'straight'
  },
  title: {
    text: 'ยอดขายรายวัน',
    align: 'left'
  },
  xaxis: {
    categories: ['1 มิ.ย.', '2 มิ.ย.', '3 มิ.ย.', '4 มิ.ย.', '5 มิ.ย.', '6 มิ.ย.', '7 มิ.ย.']
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm'
    }
  }
});

const lineChartSeries = ref([
  {
    name: 'ยอดขาย',
    data: [3000, 3500, 4000, 4500, 5000, 5500, 6000]
  }
]);
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
                    <v-card-subtitle>ยอดรวมเงินสดวันนี้ :{{sum}}</v-card-subtitle>
                  </span>
                </v-card-subtitle>
              </template>
              <template v-else>
                <v-btn @click="openCreateDialog">กรอกจำนวนเงินวันนี้</v-btn>
              </template>
         
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                รายได้
   
              </v-card-title>
              <v-card-subtitle class="text-h4">{{ ReportFinnceStore.dailyReport.totalSales }}</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                จำนวนรายการ
   
              </v-card-title>
              <v-card-subtitle class="text-h4">{{ ReportFinnceStore.dailyReport.totalTransactions }}</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                ส่วนลด
  
              </v-card-title>
              <v-card-subtitle class="text-h4">{{ ReportFinnceStore.dailyReport.totalDiscount }}</v-card-subtitle>
   
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <div>
          <apexchart type="line" :options="lineChartOptions" :series="lineChartSeries"></apexchart>
        </div>
      </v-col>
      <v-col cols="6">
        <div>
          <apexchart type="line" :options="lineChartOptions" :series="lineChartSeries"></apexchart>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
v-card {
  padding: 16px;
}
</style>
