<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import CreateDialogAddCashier from '../../components/reports/cashier/DialogAddCashier.vue';
import CreateHistoryDialogCashier from '../../components/reports/cashier/HistoryCashier.vue';
import { useExpenditureStore } from '@/stores/report/expenditure.store';
import { useRevenueStore } from '@/stores/report/revenue.store';

import Swal from 'sweetalert2';
const ReportFinnceStore = useReportFinnceStore();
const expenditureStore = useExpenditureStore();
const revenueStore = useRevenueStore();
const chartSeries = ref([0, 0]);
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
  // Update line chart data for store (ร้านกาแฟ)
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
      name: 'ยอดขายร้านกาแฟ',
      data: data
    }
  ];

  // Update line chart data for food (ข้าว)
  let groupedDataFood;
  switch (groupBy.value) {
    case 'day':
      groupedDataFood = ReportFinnceStore.stateFood.groupedByDay;
      break;
    case 'month':
      groupedDataFood = ReportFinnceStore.stateFood.groupedByMonth;
      break;
    case 'year':
      groupedDataFood = ReportFinnceStore.stateFood.groupedByYear;
      break;
  }
  const categoriesFood = Object.keys(groupedDataFood);
  const dataFood = Object.values(groupedDataFood);

  lineChartOptions2.value = {
    ...lineChartOptions2.value,
    xaxis: {
      categories: categoriesFood
    }
  };

  lineChartSeries2.value = [
    {
      name: 'ยอดขายข้าว',
      data: dataFood
    }
  ];
};

onMounted(async () => {
  try {
    await ReportFinnceStore.getDailyReport(); //ยอดขายรายวันของร้านกาแฟ
    await ReportFinnceStore.getDailyReportFood(); //ยอดขายรายวันของข้าว
    await ReportFinnceStore.getcoffeeSummary();
    await expenditureStore.fetchExpenditure();
    await revenueStore.fetchRevenue();
    await fetchGroupedFinance();
    updateChartData();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ((error as any).response && (error as any).response.status === 404) {
        openCreateDialog(); 
      } else {
        console.error(error.message);
      }
    } else {
      console.error('Unknown error', error);
    }
  }
});



const fetchGroupedFinance = async () => {
  await ReportFinnceStore.fetchGroupedFinance(dateRange.value.startDate, dateRange.value.endDate);
  await ReportFinnceStore.fetchGroupedFinanceFood(dateRange.value.startDate, dateRange.value.endDate);
  updateLineChartData();
};
const sum = computed(() => {
  const cash = parseFloat(ReportFinnceStore.sumType.cash) || 0;
  const cashierAmount = ReportFinnceStore.cashiers ? parseFloat(ReportFinnceStore.cashiers.cashierAmount) || 0 : 0;
  return cash + cashierAmount;
});
const openCreateDialog = () => {
  ReportFinnceStore.createCashierDialog = true;
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
    text: 'ยอดขายร้านกาแฟ',
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
    name: 'ยอดขายร้านกาแฟ',
    data: []
  }
]);
const lineChartOptions2 = ref({
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
    text: 'ยอดขายร้านข้าว',
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

const lineChartSeries2 = ref([
  {
    name: 'ยอดขายข้าว',
    data: []
  }
]);
watch(
  () => [dateRange.value.startDate, dateRange.value.endDate],
  () => {
    fetchGroupedFinance();
  },
  { immediate: true }
);

// Watch สำหรับ groupBy
watch(
  () => groupBy.value,
  () => {
    fetchGroupedFinance();
  },
  { immediate: true }
);
</script>

<template>
  <CreateDialogAddCashier />
  <CreateHistoryDialogCashier />
  <v-container>
    <v-carousel hide-delimiter-background hide-delimiters height="290"
      style="background-color: #C7AE8D; border-radius: 20px;">
      <!-- ยอดขายวันนี้ร้านกาแฟ -->
      <v-carousel-item>
        <v-card-title class="text-center">

          <v-icon size="25px">mdi-coffee-maker</v-icon>
          ยอดขายวันนี้ร้านกาแฟ
        </v-card-title>
        <v-row class="px-4">

          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12" md="6">
                <v-card style="height: 100%">
                  <v-card-title class="d-flex justify-space-between align-center mt-2">
                    รายได้
                  </v-card-title>
                  <v-card-subtitle class="text-h5">{{ ReportFinnceStore.dailyReport.totalSales }} บาท</v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card class="mb-2">
                  <v-card-title class="d-flex justify-space-between align-center">
                    จำนวนรายการ
                  </v-card-title>
                  <v-card-subtitle class="text-h5">{{ ReportFinnceStore.dailyReport.totalTransactions }}
                    รายการ</v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title class="d-flex justify-space-between align-center">
                    ส่วนลด
                  </v-card-title>
                  <v-card-subtitle class="text-h5">{{ ReportFinnceStore.dailyReport.totalDiscount }}
                    บาท</v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-carousel-item>

      <!-- ยอดขายวันนี้ร้านอาหาร -->
      <v-carousel-item>
        <v-card-title class="text-center">
          <v-icon size="25px">mdi-pasta</v-icon>
          ยอดขายวันนี้ร้านอาหาร
        </v-card-title>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" md="8">
            <v-row justify="center" no-gutters>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-10">
                  <v-card-title>
                    รายได้
                  </v-card-title>
                  <v-card-subtitle class="text-h4">
                    {{ ReportFinnceStore.dailyReportFood.totalSales }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-10">
                  <v-card-title>
                    จำนวนรายการ
                  </v-card-title>
                  <v-card-subtitle class="text-h4">
                    {{ ReportFinnceStore.dailyReportFood.totalTransactions }} รายการ
                  </v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-10">
                  <v-card-title>
                    ส่วนลด
                  </v-card-title>
                  <v-card-subtitle class="text-h4">
                    {{ ReportFinnceStore.dailyReportFood.totalDiscount }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-carousel-item>

      <!-- กำไร & ต้นทุนร้านกาแฟทั้งหมด -->
      <v-carousel-item>
        <v-card-title class="text-center">
          <v-icon size="25px">mdi-chart-histogram</v-icon>
          กำไร & ต้นทุนร้านกาแฟทั้งหมด
        </v-card-title>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" md="4" class="pa-2" style="width: fit-content;">
            <v-card class="d-flex justify-center align-center mt-10">
              <v-card-title class="text-center">
                ต้นทุน
              </v-card-title>
              <v-card-subtitle class="text-h5">
                {{ ReportFinnceStore.coffeeSummary.totalCost }} บาท
              </v-card-subtitle>
            </v-card>
            <v-card class="d-flex justify-center align-center mt-2">
              <v-card-title class="text-center">
                ยอดขาย
              </v-card-title>
              <v-card-subtitle class="text-h5">
                {{ ReportFinnceStore.coffeeSummary.totalSales }} บาท
              </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="d-flex justify-center align-center mt-10">
              <v-card-title class="text-center">
                ส่วนลด
              </v-card-title>
              <v-card-subtitle class="text-h5">
                {{ ReportFinnceStore.coffeeSummary.totalDiscount }} บาท
              </v-card-subtitle>
            </v-card>
            <v-card class="d-flex justify-center align-center mt-2">
              <v-card-title class="text-center">
                จำนวนรายการ
              </v-card-title>
              <v-card-subtitle class="text-h5">
                {{ ReportFinnceStore.coffeeSummary.totalOrders }} รายการ
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-carousel-item>
    </v-carousel>

    <v-row class="mt-4 ml-1">
      <v-text-field label="เริ่มวันที่" v-model="dateRange.startDate" type="date" dense hide-details variant="solo"
        class="mr-4" />
      <v-text-field label="ถึงวันที่" v-model="dateRange.endDate" type="date" dense hide-details variant="solo"
        class="mr-4" />
      <v-select label="กรองตาม" :items="['day', 'month', 'year']" v-model="groupBy" dense hide-details variant="solo"
        class="mr-4" />
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <apexchart style="height: fit-content; width: fit-content;" type="line" :options="lineChartOptions"
          :series="lineChartSeries"></apexchart>
      </v-col>
      <v-col cols="12" md="6">
        <apexchart style="height: fit-content; width: fit-content;" type="line" :options="lineChartOptions2"
          :series="lineChartSeries2"></apexchart>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
v-card {
  padding: 10px;
}

.text-h4 {
  font-size: 1.4rem;
}

@media (max-width: 768px) {
  .mr-4 {
    margin-right: 0 !important;
    margin-bottom: 8px;
  }

  .v-col {
    padding-left: 0;
    padding-right: 0;
  }

  .text-h4 {
    font-size: 1.4rem;
  }

  .text-center {
    text-align: center !important;
  }
}
</style>
