<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
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
const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(today.setDate(diff));
};
const getFridayOfCurrentWeek = () => {
  const monday = getMondayOfCurrentWeek();
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return friday;
};
const startDate = getMondayOfCurrentWeek();
const endDate = getFridayOfCurrentWeek();
const dateRange = ref({
  startDate: startDate.toISOString().split('T')[0],
  endDate: endDate.toISOString().split('T')[0],
});
const groupBy = ref<'day' | 'month' | 'year'>('day');
const updateLineChartData = () => {
  let groupedData;
  switch (groupBy.value) {
    case 'day':
      groupedData = ReportFinnceStore.state.groupedByDay;
      break;
    case 'month':
      groupedData = ReportFinnceStore.state.groupedByMonth;
      break;
    case 'year':
      groupedData = ReportFinnceStore.state.groupedByYear;
      break;
  }
  const categories = Object.keys(groupedData);
  const data = Object.values(groupedData);

  lineChartOptions.value = {
    ...lineChartOptions.value,
    xaxis: {
      categories: categories
    }
  };

  lineChartSeries.value = [
    {
      name: 'ยอดขาย',
      data: data
    }
  ];
};
onMounted(async () => {
  await ReportFinnceStore.getfindToday();
  await ReportFinnceStore.getSumType();
  await ReportFinnceStore.getDailyReport();
  await fetchGroupedFinance();
  updateChartData();
});
const fetchGroupedFinance = async () => {
  await ReportFinnceStore.fetchGroupedFinance(dateRange.value.startDate, dateRange.value.endDate);
  updateLineChartData();
};
const sum = computed(() => {
  const cash = parseFloat(ReportFinnceStore.sumType.cash) || 0;
  const cashier = ReportFinnceStore.cashiers;
  const start = cashier ? parseFloat(cashier.cashierAmount) : 0;
  return cash + start;
});
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
    text: 'ยอดขาย',
    align: 'center'
  },
  xaxis: {
    categories: []
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
    data: []
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
      <v-col cols="12" md="4">
        <v-text-field
          label="เริ่มวันที่"
          v-model="dateRange.startDate"
          type="date"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          label="ถึงวันที่"
          v-model="dateRange.endDate"
          type="date"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="กรองตาม"
          :items="['day', 'month', 'year']"
          v-model="groupBy"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-btn @click="fetchGroupedFinance">อัปเดตกราฟ</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <apexchart type="line" :options="lineChartOptions" :series="lineChartSeries"></apexchart>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
v-card {
  padding: 16px;
}
</style>
