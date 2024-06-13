<template>
    <div class="container">
      <div class="section">
        <h2>การใช้วัตถุดิบ 5 ยอดนิยม</h2>
        <div class="date-picker">
          <input type="date" placeholder="วันที่เริ่มต้น" />
          <input type="date" placeholder="วันที่สิ้นสุด" />
          <button>+</button>
        </div>
        <div class="charts">
            <v-col>
            <div id="pieChart"></div>
          </v-col>
          <table>
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>จำนวนคงเหลือใช้</th>
                <th>ปริมาณ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>หมวกแฟ่</td>
                <td>25</td>
                <td>400 กรัม</td>
              </tr>
              <tr>
                <td>นมผง</td>
                <td>30</td>
                <td>1500 กรัม</td>
              </tr>
              <tr>
                <td>หมวกเขียว</td>
                <td>15</td>
                <td>150 กรัม</td>
              </tr>
              <tr>
                <td>น้ำเชื่อม</td>
                <td>7</td>
                <td>500 ซีซี</td>
              </tr>
              <tr>
                <td>ไซรัป</td>
                <td>5</td>
                <td>200 ซีซี</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <div class="section">
        <h2>นำเข้าวัตถุดิบ</h2>
        <div class="total-import">ยอดรวมนำเข้าวัตถุดิบ: 30,000</div>
        <div id="lineChart"></div>
        <table>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>จำนวนเงิน</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>05/04/2024</td>
              <td>2,540</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td>21/03/2024</td>
              <td>3,000</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td>10/03/2024</td>
              <td>4,000</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td>1/02/2024</td>
              <td>500</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
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
            <tr>
              <td>1</td>
              <td>ฮีพี-เมจ นมพาสเจอร์ไรส์</td>
              <td>เมจ</td>
              <td>2</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div class="section">
        <h2>ประวัติการเช็ควัตถุดิบ</h2>
        <table>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ผู้รับผิดชอบ</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>5/5/2024 16:30</td>
              <td>กุลธิรา</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td>25/4/2024 10:30</td>
              <td>กุลธิรา</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
import { onMounted } from 'vue';
import ApexCharts from 'apexcharts';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();

const pieChartOptions = {
  series: [44, 55, 13, 43, 22],
  chart: {
    width: 380,
    type: 'pie',
  },
  labels: ['หมวกแฟ่', 'นมผง', 'หมวกเขียว', 'น้ำเชื่อม', 'ไซรัป'],
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
  }]
};

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

onMounted(() => {
  const pieChart = new ApexCharts(document.querySelector("#pieChart"), pieChartOptions);
  pieChart.render();

  const lineChart = new ApexCharts(document.querySelector("#lineChart"), lineChartOptions);
  lineChart.render();
});
</script>
  
  <style>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
  background-color: #45a049;
}

#pieChart, #lineChart {
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
}
</style>