<script lang="ts" setup>
import { onMounted ,ref,computed ,watch} from 'vue';
import ApexCharts from 'apexcharts';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useRouter } from 'vue-router'; 
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
    formatter: function (val: number) {
      return val + ' units';
    }
  },
  xaxis: {
    categories: chartCategories.value, 
    title: {
      text: 'Ingredients'
    }
  },
  yaxis: {
    title: {
      text: 'Quantity'
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
    categories: ['05/04/2024', '21/03/2024', '10/03/2024', '1/02/2024']
  },
  yaxis: {
    title: {
      text: 'จำนวนเงิน (บาท)'
    }
  }
};
const updateChartData = async () => {
  await productUsageStore.loadIngredientsUsage(startDate.value, endDate.value);
  const ingredients = productUsageStore.ingredientsUsage; // Assuming this is the data structure
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

</script>
<template>
       <div class="section">
        <h2>วัตถุดิบเหลือน้อย</h2>
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อ</th>
              <th>ผู้จัดหา</th>
              <th>จำนวน</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in ingredientStore.ingredientlow" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.ingredientName }}</td>
            <td>{{ item.ingredientSupplier }}</td>
         <td>{{ item.ingredientQuantityInStock }}</td>
          </tr>
        </tbody>
        <tbody v-if="!ingredientStore.ingredientlow.length">
          <tr>
            <td colspan="9" class="text-center">No data</td>
          </tr>
        </tbody>
        </table>
      </div>
      <v-carousel hide-delimiter-background hide-delimiters style="border-radius: 20px;">
      <!-- Slide 1: Import Data -->
      <v-carousel-item>
        <div class="section">
          <h2>นำเข้าวัตถุดิบ</h2>
          <div class="total-import">ยอดรวมนำเข้าวัตถุดิบ: 30,000</div>
          <v-row>
            <v-col>
              <div id="lineChart"></div>
            </v-col>
            <v-col>
              <table>
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>05/04/2024</td>
                    <td>2,540</td>
                  </tr>
                  <tr>
                    <td>21/03/2024</td>
                    <td>3,000</td>
                  </tr>
                  <tr>
                    <td>10/03/2024</td>
                    <td>4,000</td>
                  </tr>
                  <tr>
                    <td>1/02/2024</td>
                    <td>500</td>
                  </tr>
                </tbody>
              </table>
            </v-col>
          </v-row>
        </div>
      </v-carousel-item>
      
      <!-- Slide 2: Usage Data -->
      <v-carousel-item>
        <div class="section">
          <h2>การใช้งานวัตถุดิบ</h2>
          <div class="date-picker">
            <input v-model="startDate" type="date" placeholder="Start Date" />
            <input v-model="endDate" type="date" placeholder="End Date" />
          </div>
          <div class="content-container">
            <div class="chart-container">
              <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="400"></apexchart>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>ชื่อ</th>
                    <th>ปริมาณที่ใช้ไป</th>
                  </tr>
                </thead>
                <tbody v-if="ingredientsUsage.length">
                  <tr v-for="(item, index) in ingredientsUsage" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.ingredientName }}</td>
                    <td>{{ item.quantity }} {{ item.unit }}</td>
                  </tr>
                </tbody>
                <tbody v-if="!ingredientsUsage.length">
                  <tr>
                    <td colspan="3" class="text-center">No data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>

    <div class="container">
    </div>
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
</style>