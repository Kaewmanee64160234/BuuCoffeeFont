<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';

const ReportFinnceStore = useReportFinnceStore();
interface ChartOptions {
  chart: {
    type: string;
  };
  labels: string[];
}

const chartOptions = ref<ChartOptions>({
  chart: {
    type: 'pie',
  },
  labels: [],
});

const chartSeries = ref<number[]>([]);
const selectedDate = ref<string>(new Date().toISOString().slice(0, 10)); 

const fetchTopSellingProducts = async (date: string) => {
  await ReportFinnceStore.getTopSellingProduct(date);
  const topProducts = ReportFinnceStore.topSellingProduct || [];

  const labels = topProducts.map((product: any) => product.productName);
  const series = topProducts.map((product: any) => product.Count);

  chartOptions.value.labels = labels;
  chartSeries.value = series;
};

const fetchData = async () => {
  const formattedDate = selectedDate.value;
  await fetchTopSellingProducts(formattedDate);
};

onMounted(async () => {
  await fetchTopSellingProducts(selectedDate.value);
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6" sm="10" md="8">
    
          <v-text-field
            v-model="selectedDate"
            label="Select Date"
            type="date"
            @change="fetchData"
          ></v-text-field>
          <apexchart
            v-if="chartOptions.labels.length > 0"
            type="pie"
            width="380"
            :options="chartOptions"
            :series="chartSeries"
          ></apexchart>
          <div v-else>No data available</div>

      </v-col>
    </v-row>
  </v-container>
</template>
  <style scoped>
  #barChart, #pieChart {
    margin: 20px 0;
  }
  </style>
  