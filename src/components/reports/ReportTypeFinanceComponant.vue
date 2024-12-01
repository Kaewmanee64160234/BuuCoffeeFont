<template>
  <v-container>
    <!-- ส่วนค้นหาตามช่วงวันที่ -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="startDate"
          type="date"
          label="วันที่เริ่มต้น"
          variant="outlined" 
          density="compact"
          :max="endDate || new Date().toISOString().substr(0,10)"
          :rules="[
            v => !endDate || v <= endDate || 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด',
            v => v <= new Date().toISOString().substr(0,10) || 'ไม่สามารถเลือกวันในอนาคตได้'
          ]"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="endDate"
          type="date" 
          label="วันที่สิ้นสุด"
          variant="outlined"
          density="compact"
          :min="startDate"
          :max="new Date().toISOString().substr(0,10)"
          :rules="[
            v => !startDate || v >= startDate || 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น',
            v => v <= new Date().toISOString().substr(0,10) || 'ไม่สามารถเลือกวันในอนาคตได้'
          ]"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-btn
          color="#9EDF9C"
          @click="exportToExcel"
        >
          Export to Excel
        </v-btn>
      </v-col>
    </v-row>

    <!-- แสดงข้อมูลร้านกาแฟ -->
    <v-card class="mb-4">
      <v-card-title class="text-h6 font-weight-bold">
        <v-icon start>mdi-coffee</v-icon>
        ข้อมูลร้านกาแฟ
      </v-card-title>
      <v-card-text>
        <v-row v-for="(report, index) in reportStore.receipts" :key="index">
          <v-col cols="12">
            <div v-for="(shift, shiftIndex) in filteredCoffeeShifts(report)" :key="shiftIndex" class="mb-4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="d-flex justify-space-between mb-2">
                    <span>เปิดการขายโดย: {{ shift.openedBy }}</span>
                    <span>ปิดการขายโดย: {{ shift.closedBy }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>เวลาเปิด: {{ new Date(shift.openedDate).toLocaleString('th-TH') }}</span>
                    <span>เวลาปิด: {{ new Date(shift.closedDate).toLocaleString('th-TH') }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>จำนวนเงินก่อนสดเปิดการขาย: {{ shift.cashierAmount}} บาท</span>
                    <span>จำนวนเงินสดปิดการขาย: {{ shift.closedAmount }} บาท</span>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex justify-space-between">
                    <span>เงินสด: {{ shift.cashTotal }} บาท</span>
                    <span>โอน: {{ shift.qrcodeTotal }} บาท</span>
                    <span>รวม: {{ shift.totalSales }} บาท</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <v-card color="primary" class="white--text">
              <v-card-text>
                <div class="d-flex justify-space-between">
                  <span>ยอดรวมเงินสดทั้งหมด: {{ calculateCoffeeTotals(report).totalCash }} บาท</span>
                  <span>ยอดรวมเงินโอนทั้งหมด: {{ calculateCoffeeTotals(report).totalQR }} บาท</span>
                  <span>ยอดรวมทั้งหมด: {{ calculateCoffeeTotals(report).total }} บาท</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- แสดงข้อมูลร้านอาหาร -->
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        <v-icon start>mdi-food</v-icon>
        ข้อมูลร้านอาหาร
      </v-card-title>
      <v-card-text>
        <v-row v-for="(report, index) in reportStore.receipts" :key="index">
          <v-col cols="12">
            <div v-for="(shift, shiftIndex) in filteredRiceShifts(report)" :key="shiftIndex" class="mb-4">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="d-flex justify-space-between mb-2">
                    <span>เปิดการขายโดย: {{ shift.openedBy }}</span>
                    <span>ปิดการขายโดย: {{ shift.closedBy }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>เวลาเปิด: {{ new Date(shift.openedDate).toLocaleString('th-TH') }}</span>
                    <span>เวลาปิด: {{ new Date(shift.closedDate).toLocaleString('th-TH') }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>จำนวนเงินก่อนสดเปิดการขาย: {{ shift.cashierAmount}} บาท</span>
                    <span>จำนวนเงินสดปิดการขาย: {{ shift.closedAmount }} บาท</span>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex justify-space-between">
                    <span>เงินสด: {{ shift.cashTotal }} บาท</span>
                    <span>โอน: {{ shift.qrcodeTotal }} บาท</span>
                    <span>รวม: {{ shift.totalSales }} บาท</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <v-card color="primary" class="white--text">
              <v-card-text>
                <div class="d-flex justify-space-between">
                  <span>ยอดรวมเงินสดทั้งหมด: {{ calculateRiceTotals(report).totalCash }} บาท</span>
                  <span>ยอดรวมเงินโอนทั้งหมด: {{ calculateRiceTotals(report).totalQR }} บาท</span>
                  <span>ยอดรวมทั้งหมด: {{ calculateRiceTotals(report).total }} บาท</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { useReceiptReportStore } from '@/stores/report_receipt.store';
import { onMounted, ref } from 'vue';
import * as XLSX from 'xlsx';

const reportStore = useReceiptReportStore();
const startDate = ref(new Date(Date.now() - 86400000).toISOString().split('T')[0]); // เมื่อวาน
const endDate = ref(new Date().toISOString().split('T')[0]); // วันนี้

onMounted(async () => {
  await reportStore.fetchReceipts();
  console.log('reportStore.receipts',reportStore.receipts);
});

const searchReports = async () => {
  await reportStore.fetchReceipts();
};

const filteredCoffeeShifts = (report) => {
  if (!startDate.value || !endDate.value) return report.coffee.shifts;
  
  return report.coffee.shifts.filter(shift => {
    const shiftDate = new Date(shift.openedDate);
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999); // ตั้งเวลาสิ้นสุดเป็น 23:59:59.999
    return shiftDate >= start && shiftDate <= end;
  });
};

const filteredRiceShifts = (report) => {
  if (!startDate.value || !endDate.value) return report.rice.shifts;
  
  return report.rice.shifts.filter(shift => {
    const shiftDate = new Date(shift.openedDate);
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999); // ตั้งเวลาสิ้นสุดเป็น 23:59:59.999
    return shiftDate >= start && shiftDate <= end;
  });
};

const calculateCoffeeTotals = (report) => {
  const shifts = filteredCoffeeShifts(report);
  return {
    totalCash: shifts.reduce((sum, shift) => sum + shift.cashTotal, 0),
    totalQR: shifts.reduce((sum, shift) => sum + shift.qrcodeTotal, 0),
    total: shifts.reduce((sum, shift) => sum + shift.totalSales, 0)
  };
};

const calculateRiceTotals = (report) => {
  const shifts = filteredRiceShifts(report);
  return {
    totalCash: shifts.reduce((sum, shift) => sum + shift.cashTotal, 0),
    totalQR: shifts.reduce((sum, shift) => sum + shift.qrcodeTotal, 0),
    total: shifts.reduce((sum, shift) => sum + shift.totalSales, 0)
  };
};

const exportToExcel = async () => {
  const reportData = reportStore.receipts.flatMap(report => {
    const coffeeShifts = filteredCoffeeShifts(report);
    const riceShifts = filteredRiceShifts(report);
    
    const coffeeData = coffeeShifts.map(shift => ({
      'ประเภทร้าน': 'ร้านกาแฟ',
      'วันที่ เวลา ที่เปิดการขาย': new Date(shift.openedDate).toLocaleString('th-TH'),
      'วันที่ เวลา ที่ปิดการขาย': new Date(shift.closedDate).toLocaleString('th-TH'),
      'พนักงานที่เปิดการขาย': shift.openedBy,
      'พนักงานที่ปิดการขาย': shift.closedBy,
      'จำนวนเงินก่อนสดเปิดการขาย': shift.cashierAmount,
      'จำนวนเงินสดปิดการขาย': shift.closedAmount,
      'ยอดรวมเงินสดที่ได้รับ': shift.cashTotal,
      'ยอดรวมเงินโอนที่ได้รับ': shift.qrcodeTotal,
      'ยอดรวมทั้งหมด': shift.totalSales
    }));

    const riceData = riceShifts.map(shift => ({
      'ประเภทร้าน': 'ร้านอาหาร',
      'วันที่ เวลา ที่เปิดการขาย': new Date(shift.openedDate).toLocaleString('th-TH'),
      'วันที่ เวลา ที่ปิดการขาย': new Date(shift.closedDate).toLocaleString('th-TH'),
      'พนักงานที่เปิดการขาย': shift.openedBy,
      'พนักงานที่ปิดการขาย': shift.closedBy,
      'จำนวนเงินก่อนสดเปิดการขาย': shift.cashierAmount,
      'จำนวนเงินสดปิดการขาย': shift.closedAmount,
      'ยอดรวมเงินสดที่ได้รับ': shift.cashTotal,
      'ยอดรวมเงินโอนที่ได้รับ': shift.qrcodeTotal,
      'ยอดรวมทั้งหมด': shift.totalSales
    }));

    return [...coffeeData, ...riceData];
  });

  // Create a workbook and add the worksheets
  const workbook = XLSX.utils.book_new();
  const reportSheet = XLSX.utils.json_to_sheet(reportData);

  // Add sheets to the workbook
  XLSX.utils.book_append_sheet(workbook, reportSheet, 'Receipt Reports');

  // Export the workbook as an Excel file
  XLSX.writeFile(workbook, 'Receipt_Report.xlsx');
};
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}

.v-card-title {
  font-weight: bold;
}

.v-list-item-title {
  font-size: 1rem;
}
</style>