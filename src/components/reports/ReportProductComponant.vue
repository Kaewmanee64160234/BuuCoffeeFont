<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useProductUsageStore } from '@/stores/report/productUsage.store';
import { usePromotionsUsageStore } from '@/stores/report/promotionUseage.store';
import type { ProductUsage } from '@/types/report/productUsage.type';
import VueApexCharts from 'vue3-apexcharts';
const promotionUsagestore = usePromotionsUsageStore();
const productUsageStore = useProductUsageStore();
const startDate = ref('');
const endDate = ref('');
const startDateforpromo = ref('2024-07-01');
const endDateforpromo = ref('2024-07-31');
const fetchPromotionsUsage = async () => {
  await promotionUsagestore.loadPromotionsUsage(startDateforpromo.value, endDateforpromo.value);
  console.log('Loaded promotions usage:', promotionUsagestore.promotionsUsage.values);
};

const promotionsUsage = promotionUsagestore.promotionsUsage;
const receiptType = ref('ร้านกาแฟ');
const receiptOptions = ref([
  { value: 'ร้านกาแฟ', text: 'ร้านกาแฟ' },
  { value: 'ร้านข้าว', text: 'ร้านข้าว' }
]);

const chartOptions = ref({
  chart: {
    type: 'pie'
  },
  labels: [] as string[],
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }],
  legend: {
    position: 'right',
    offsetY: 0,
    height: 230
  }
});

const chartSeries = ref<number[]>([]);

const fetchData = async () => {

  await productUsageStore.loadProductsUsage(startDate.value, endDate.value, receiptType.value);
  updateChartData();

};

const updateChartData = () => {

  const topProducts = productUsageStore.productsUsage
    .sort((a: ProductUsage, b: ProductUsage) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);


  chartOptions.value.labels = topProducts.map(item => `${item.productName} ${item.productTypeName}`);
  chartSeries.value = topProducts.map(item => item.totalQuantity);

};


onMounted(async () => {
  await fetchPromotionsUsage();
  await fetchData();
});

watch([startDate, endDate, receiptType], async () => {
  await fetchData();
});
watch([startDateforpromo, endDateforpromo], async () => {
  await fetchPromotionsUsage();
});

</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-row align="center" class="mb-4">
          <!-- Date Pickers and Load Data Button -->
          <v-col cols="auto">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row align="center" justify="center" class="mb-4">
          <h2>สินค้าขายดี</h2>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-radio-group
              v-model="receiptType"
              column
            >
              <v-radio
                v-for="option in receiptOptions"
                :key="option.value"
                :value="option.value"
                :label="option.text"
              ></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="4">
            <!-- Chart -->
            <apexchart
              v-if="chartOptions.labels.length > 0"
              type="pie"
              width="380"
              :options="chartOptions"
              :series="chartSeries"
            ></apexchart>
          </v-col>
          <v-row>
            <!-- Data Table -->
            <v-data-table
              v-if="productUsageStore.productsUsage.length > 0"
              
              :items="productUsageStore.productsUsage"
              item-key="productNameAndType"
            >
            <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อเมนู</th>
              <th>จำนวนออเดอร์ที่สั่ง</th>
              <th>จำนวนรวมที่ขายได้</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in productUsageStore.productsUsage" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.productName }} {{ item.productTypeName }}</td>
                  <td>{{ item.usageCount }} รายการ</td>
                  <td>{{ item.totalQuantity }} แก้ว</td>
          </tr>
        </tbody>
            </v-data-table>
            <v-alert v-else type="info">
              No data available
            </v-alert>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Start Date"
            type="date"
            v-model="startDateforpromo"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="End Date"
            type="date"
            v-model="endDateforpromo"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h2>รายงานโปรโมชั่น</h2>
        </v-col>
      </v-row>
      <v-row v-if="promotionsUsage.length">
      <v-col cols="12" md="3" v-for="(item, index) in promotionUsagestore.promotionsUsage" :key="index">
        <v-card class="promotion-card">
          <v-card-title>{{ item.promotionName }}</v-card-title>
          <v-card-subtitle>
            จำนวนครั้งที่ใช้ : {{ item.usageCount }}
          </v-card-subtitle>
          <v-card-text>
            ยอดรวมส่วนลด: {{ item.totalDiscount }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.promotion-card {
  background-color: #FFF9C4; /* Light yellow background */
}
</style>
