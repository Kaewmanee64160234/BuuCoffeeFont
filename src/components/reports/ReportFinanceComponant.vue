<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import { useExpenditureStore } from '@/stores/report/expenditure.store';
import { useRevenueStore } from '@/stores/report/revenue.store';
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
    await ReportFinnceStore.getDailyReport(); 
    await ReportFinnceStore.getDailyReportFood(); 
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
    height: 450,
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
    align: 'center',
    style: {
      fontSize: '20px', // Increase font size
      fontWeight: 'bold'
    }
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
    height: 450,
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
    align: 'center',
    style: {
      fontSize: '20px', // Increase font size
      fontWeight: 'bold'
    }
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
  <v-container>
    <v-carousel hide-delimiter-background hide-delimiters height="290"
      style="background-color: #C7AE8D; border-radius: 20px;">
      <!-- ยอดขายวันนี้ร้านกาแฟ -->
      <v-carousel-item >
        <v-card-title class="text-center" style="margin-top: 20px; font-weight: bold;"><v-icon size="25px">mdi-coffee-maker</v-icon>ยอดขายร้านกาแฟ</v-card-title>
        <v-card-subtitle class="text-center">{{ new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long' }) }}</v-card-subtitle>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" md="8">
            <v-row justify="center" no-gutters>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>
                    รายได้
                  </v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #2E7D32;">
                    {{ ReportFinnceStore.dailyReport.totalSales }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>
                    จำนวนรายการ
                  </v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #2E7D32;">
                    {{ ReportFinnceStore.dailyReport.totalTransactions }} รายการ
                  </v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>
                    ส่วนลด
                  </v-card-title>
                  <v-card-subtitle  style="font-size: 24px; font-weight: bold; color: #FF7F7F;">
                    {{ ReportFinnceStore.dailyReport.totalDiscount }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-carousel-item>

      <!-- ยอดขายวันนี้ร้านอาหาร -->
      <v-carousel-item>
        <v-card-title class="text-center" style="margin-top: 20px; font-weight: bold;"><v-icon size="25px">mdi-pasta</v-icon>ยอดขายร้านข้าว</v-card-title>
        <v-card-subtitle class="text-center">{{ new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long' }) }}</v-card-subtitle>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" md="8">
            <v-row justify="center" no-gutters>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>
                    รายได้
                  </v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #2E7D32;">
                    {{ ReportFinnceStore.dailyReportFood.totalSales }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>
                    จำนวนรายการ
                  </v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #2E7D32;">
                    {{ ReportFinnceStore.dailyReportFood.totalTransactions }} รายการ
                  </v-card-subtitle>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>
                    ส่วนลด
                  </v-card-title>
                  <v-card-subtitle  style="font-size: 24px; font-weight: bold; color: #FF7F7F;">
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
        <v-card-title class="text-center" style="margin-top: 20px; font-weight: bold;">
          <v-icon size="25px">mdi-glass-cocktail</v-icon>จัดเลี้ยงรับรอง
        </v-card-title>
        <v-card-subtitle class="text-center">
          เดือน{{ new Date().toLocaleDateString('th-TH', { month: 'long' }) }}
        </v-card-subtitle>
        
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" md="8">
            <v-row justify="center" no-gutters>
              <v-col cols="12" md="6" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>จำนวนครั้งที่จัดเลี้ยง</v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #FF7F7F;">
                    {{ ReportFinnceStore.coffeeSummary.totalCost }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>กำไรรวมจัดเลี้ยง</v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #2E7D32;">
                    {{ ReportFinnceStore.coffeeSummary.totalSales }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>

              <v-col cols="12" md="6" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>รอดำเนินการ</v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #FF7F7F;">
                    {{ ReportFinnceStore.coffeeSummary.totalDiscount }} บาท
                  </v-card-subtitle>
                </v-card>
              </v-col>

              <v-col cols="12" md="6" class="pa-2">
                <v-card class="text-center mt-6">
                  <v-card-title>เสร็จสิ้น</v-card-title>
                  <v-card-subtitle style="font-size: 24px; font-weight: bold; color: #2E7D32;">
                    {{ ReportFinnceStore.coffeeSummary.totalOrders }} รายการ
                  </v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-carousel-item>
    </v-carousel>

    <v-row class="mt-6 ml-1">
      <v-text-field label="เริ่มวันที่" v-model="dateRange.startDate" type="date" dense hide-details variant="solo"
        class="mr-4" />
      <v-text-field label="ถึงวันที่" v-model="dateRange.endDate" type="date" dense hide-details variant="solo"
        class="mr-4" />
      <v-select label="กรองตาม" :items="['day', 'month', 'year']" v-model="groupBy" dense hide-details variant="solo"
        class="mr-4" />
    </v-row>

    <v-row class="mt-6">
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
