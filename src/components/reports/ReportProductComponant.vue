<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useProductUsageStore } from '@/stores/report/productUsage.store';
import type { ProductUsage } from '@/types/report/productUsage.type';
import VueApexCharts from 'vue3-apexcharts';
const productUsageStore = useProductUsageStore();
const startDate = ref(new Date().toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);


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
  dataLabels: {
    style: {
      fontSize: '16px', 
    }
  },
  legend: {
    position: 'right',
    labels: {
      colors: undefined,
      useSeriesColors: false,
      fontSize: '16px'
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'right',
        labels: {
          fontSize: '16px'
        }
      }
    }
  }]
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


  chartOptions.value.labels = topProducts.map(
    item => `${item.productName} ${item.productTypeName}`
  );
  
  chartSeries.value = topProducts.map(item => item.totalQuantity);

};


onMounted(async () => {

  await fetchData();
});

watch([startDate, endDate, receiptType], async () => {
  await fetchData();
});


</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">

            <v-row align="center" class="mb-4">

              <v-col cols="auto">
                <v-text-field
                  v-model="startDate"
                  label="Start Date"
                  type="date"
                  outlined
                  dense hide-details variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="auto">
                <v-text-field
                  v-model="endDate"
                  label="End Date"
                  type="date"
                  outlined
                  dense hide-details variant="solo"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center" justify="center" class="mb-4">
              <h2 style="font-size: 25px;">สินค้าขายดี</h2>
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
                    style="font-size: 20px;"
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
            </v-row>
            <v-row>
              <!-- Data Table -->
              <v-data-table
                v-if="productUsageStore.productsUsage.length > 0"
                :items="productUsageStore.productsUsage"
                item-key="productNameAndType"
              >
                <thead>
                  <tr>
                    <th style="font-size: 16px;">ลำดับ</th>
                    <th style="font-size: 16px;">ชื่อเมนู</th>
                    <th style="font-size: 16px;">จำนวนออเดอร์ที่สั่ง</th>
                    <th style="font-size: 16px;">จำนวนรวมที่ขายได้</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in productUsageStore.productsUsage" :key="index">
                    <td style="font-size: 16px;">{{ index + 1 }}</td>
                    <td style="font-size: 16px;">{{ item.productName }} {{ item.productTypeName }}</td>
                    <td style="font-size: 16px;">{{ item.usageCount }} รายการ</td>
                    <td style="font-size: 16px;">{{ item.totalQuantity }} แก้ว</td>
                  </tr>
                </tbody>
              </v-data-table>
              <v-alert v-else type="info">
                No data available
              </v-alert>
            </v-row>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.navigation-drawer {
  background-color: #fafafa;
}

.username {
  color: #795548;
  font-weight: bold;
}

.v-list-item {
  color: #795548;
}

.v-list-item:hover {
  background-color: #4d4a3a81;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.promotion-card {
  margin: 20px;
}

@media (max-width: 600px) {
  .promotion-card {
    margin: 10px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .v-data-table {
    font-size: 0.8rem;
  }

  .v-carousel-item {
    padding: 16px;
  }
}
</style>
