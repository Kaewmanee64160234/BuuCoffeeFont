<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import ApexCharts from 'apexcharts';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useProductUsageStore } from '@/stores/report/productUsage.store';

const chartSeries = ref([
  {
    name: 'Quantity',
    data: []
  }
]);

const chartCategories = ref<string[]>([]);

const chartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      dataLabels: {
        position: 'top'
      }
    }
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '16px'
    },
    formatter: function (val: number) {
      return val + ' units';
    }
  },
  xaxis: {
    categories: chartCategories.value,
    title: {
      text: 'Ingredients',
      fontSize: '16px'
    },
    labels: {
      style: {
        fontSize: '16px' // ปรับขนาดตัวอักษรของป้ายกำกับ x-axis
      }
    }
  },
  yaxis: {
    title: {
      text: 'จำนวน (ชิ้น)',
      style: {
        fontSize: '16px' // ปรับขนาดตัวอักษรของป้ายกำกับ y-axis
      }
    },
    labels: {
      style: {
        fontSize: '16px' // ปรับขนาดตัวอักษรของป้ายกำกับ y-axis
      }
    }
  },
  fill: {
    opacity: 1
  },
  colors: ['#00E396'],
  title: {
    text: 'วัตถุดิบ 5 อันดับยอดนิยม',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  }
});

const productUsageStore = useProductUsageStore();
const ingredientStore = useIngredientStore();
const startDate = ref('2024-07-19');
const endDate = ref('2024-12-17');

const lineChartOptions = {
  series: [{
    name: 'ยอดเงินนำเข้าวัตถุดิบ',
    data: [2540, 3000, 4000, 500]
  }],
  chart: {
    type: 'line',
    height: 350
  },
  xaxis: {
    categories: ['05/04/2024', '21/03/2024', '10/03/2024', '1/02/2024'],style: {
        fontSize: '16px'
      }
  },
  yaxis: {
    title: {
      text: 'จำนวนเงิน (บาท)',
      style: {
        fontSize: '16px'
      }
    }
  }
};

const updateChartData = async () => {
  await productUsageStore.loadIngredientsUsage(startDate.value, endDate.value);
  const ingredients = productUsageStore.ingredientsUsage;
  const sortedIngredients = ingredients.sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  chartCategories.value = sortedIngredients.map(item => item.ingredientName);
  chartSeries.value[0].data = sortedIngredients.map(item => item.quantity);
};

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    updateChartData();
  }
}, { immediate: true });

onMounted(async () => {
  await ingredientStore.getIngredientlow();
  const lineChart = new ApexCharts(document.querySelector("#lineChart"), lineChartOptions);
  lineChart.render();
  if (startDate.value && endDate.value) {
    await updateChartData();
  }
});

const ingredientsUsage = computed(() => productUsageStore.ingredientsUsage);
const sortedIngredients = computed(() => {
  return ingredientStore.ingredientlow.slice().sort((a, b) => a.ingredientQuantityInStock - b.ingredientQuantityInStock);
});
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="section">
          <h2>วัตถุดิบเหลือน้อย</h2>
          <table>
            <thead>
              <tr>
                <th style="font-size: 18px;">ลำดับ</th>
                <th style="font-size: 18px;">ชื่อ</th>
                <th style="font-size: 18px;">ผู้จัดหา</th>
                <th style="font-size: 18px;">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in sortedIngredients" :key="index" :class="{'negative-quantity': item.ingredientQuantityInStock < 0}">
                <td style="font-size: 16px;">{{ index + 1 }}</td>
                <td style="font-size: 16px;">{{ item.ingredientName }}</td>
                <td style="font-size: 16px;">{{ item.ingredientSupplier }}</td>
                <td style="font-size: 16px;">
                  {{ item.ingredientQuantityInStock }}
                  <span v-if="item.ingredientQuantityInStock < 0" class="reminder" style="color: red; font-size: 16px;">
                    <v-icon left>mdi-alert</v-icon> "อย่าลืม import สินค้าเข้า"
                  </span>
                </td>
              </tr>
            </tbody>
            <tbody v-if="!sortedIngredients.length">
              <tr>
                <td style="font-size: 16px;" colspan="4" class="text-center">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>
    
    <v-carousel hide-delimiter-background hide-delimiters style="border-radius: 20px;padding: 16px;" class="v-carousel">
      <!-- Slide 1: Import Data -->
      <v-carousel-item class="v-carousel-item">
        <div class="section chart-container" style="padding-bottom: 24px;">
          <h2>นำเข้าวัตถุดิบ</h2>
          <div style="font-size: 16px;" class="total-import">ยอดรวมนำเข้าวัตถุดิบ: 30,000</div>
          <v-row>
            <v-col cols="12" md="6">
              <div style="font-size: 16px;" id="lineChart"></div>
            </v-col>
            <v-col cols="12" md="6">
              <table>
                <thead>
                  <tr>
                    <th style="font-size: 18px;">วันที่</th>
                    <th style="font-size: 18px;">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-size: 16px;">05/04/2024</td>
                    <td style="font-size: 16px;">2,540</td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px;">21/03/2024</td>
                    <td style="font-size: 16px;">3,000</td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px;">10/03/2024</td>
                    <td style="font-size: 16px;">4,000</td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px;">1/02/2024</td>
                    <td style="font-size: 16px;">500</td>
                  </tr>
                </tbody>
              </table>
            </v-col>
          </v-row>
        </div>
      </v-carousel-item>
      
      <!-- Slide 2: Usage Data -->
      <v-carousel-item>
        <div class="section" style="padding-bottom: 24px;">
          <h2>การใช้งานวัตถุดิบ</h2>
          <v-row>
            <v-col cols="12" md="6">
              <input style="font-size: 16px;" v-model="startDate" type="date" placeholder="Start Date" class="w-full mb-4" />
              <input style="font-size: 16px;" v-model="endDate" type="date" placeholder="End Date" class="w-full mb-4" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="400"></apexchart>
            </v-col>
            <v-col cols="12" md="6">
              <table style="width: 100%; table-layout: fixed;">
                <thead>
                  <tr>
                    <th style="font-size: 18px; width: 20%;">ลำดับ</th>
                    <th style="font-size: 18px; width: 40%;">ชื่อ</th>
                    <th style="font-size: 18px; width: 40%;">ปริมาณที่ใช้ไป</th>
                  </tr>
                </thead>
                <tbody v-if="ingredientsUsage.length">
                  <tr v-for="(item, index) in ingredientsUsage" :key="index">
                    <td style="font-size: 16px;">{{ index + 1 }}</td>
                    <td style="font-size: 16px;">{{ item.ingredientName }}</td>
                    <td style="font-size: 16px;">{{ item.quantity }} {{ item.unit }}</td>
                  </tr>
                </tbody>
                <tbody v-if="!ingredientsUsage.length">
                  <tr>
                    <td style="font-size: 16px;" colspan="3" class="text-center">No data</td>
                  </tr>
                </tbody>
              </table>
            </v-col>
            
          </v-row>
        </div>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>
  

  
  <style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.content-container {
  display: flex;
  gap: 20px; 
}

.chart-container {
  flex: 1;
}

.table-container {
  flex: 1;
  overflow-x: auto; 
}

.section {
  width: 100%;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.date-picker {
  display: flex;
  gap: 10px;
}

.charts {
  display: flex;
  gap: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

table, th, td {
  border: 1px solid #ddd;
}

th, td {
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #3a75c2;
}

#pieChart, #lineChart {
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
}

.v-carousel {
  position: relative;
  overflow: visible; /* Allow the buttons to overflow */
}

.v-carousel__prev,
.v-carousel__next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.v-carousel__prev {
  left: -40px; /* Push the button further left */
}

.v-carousel__next {
  right: -40px; /* Push the button further right */
}

.v-carousel-item {
  padding-left: 50px; /* Add padding to create space for the buttons */
  padding-right: 50px;
}

.card-content {
  padding: 16px; /* Adjust the padding to keep content away from the buttons */
}

</style>