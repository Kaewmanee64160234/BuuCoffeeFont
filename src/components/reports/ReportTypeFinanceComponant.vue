
<template>
  <div>
    <!-- หัวข้อหลัก: รายงานยอดขาย -->
    <h2>รายงานยอดขาย</h2>
    <button
      class="ma-2"
      style="
        background-color: #9EDF9C;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      "
      @click="exportToExcel"
    >
      Export to Excel
    </button>

    <!-- รายละเอียดใบเสร็จ -->
    <section>
      <h3 style="font-size: 20px;" class="mb-1">สรุปรายการใบเสร็จ</h3>
      <div class="no-data-message" v-if="reportStore.receipts.length === 0" style="color: red;">
        ยังไม่มีข้อมูล
      </div>
      <div v-for="(report, index) in reportStore.receipts" :key="index" class="receipt-summary">
        <p style="font-size: 16px;"><strong>วันที่เปิดการขาย:</strong> {{ report.openedDate }}</p>
        <p style="font-size: 16px;"><strong>วันที่ปิดการขาย:</strong> {{ report.closedDate }}</p>
        <p style="font-size: 16px;"><strong>พนักงานที่เปิดการขาย:</strong> {{ report.openedBy }}</p>
        <p style="font-size: 16px;"><strong>พนักงานที่เปิดการขาย:</strong> {{ report.closedBy }}</p>
        <p style="font-size: 16px;"><strong>ยอดรวมเงินสดที่ได้รับ:</strong> {{ report.cashTotal }}</p>
        <p style="font-size: 16px;"><strong>ยอดรวมเงินโอนที่ได้รับ:</strong> {{ report.qrcodeTotal }}</p>
      </div>
      <p>-----------------------------</p>
    </section>
  
    <!-- รายละเอียดใบเสร็จเงินสด -->
    <section>
      <h3 style="font-size: 20px;" class="mb-1">รายละเอียดใบเสร็จที่ชำระด้วยเงินสด</h3>
      
      <div v-for="(report, index) in reportStore.receipts" :key="'cash-' + index" class="cash-receipt-details">
        <h4 style="font-size: 16px;">รหัสพนักงาน: {{ report.cashierId }}</h4>
        <div class="no-data-message" v-if="reportStore.receipts.every(report => report.cash.length === 0)" style="color: red;">
          ยังไม่มีข้อมูล
        </div>
        <div v-for="(receipt, i) in report.cash" :key="'cash-receipt-' + i">
          <p style="font-size: 16px;"><strong>เวลาที่ขาย:</strong> {{ receipt.saleTime }}</p>
          <p style="font-size: 16px;"><strong>จำนวนเงิน:</strong> {{ receipt.totalPrice }}</p>
          <p style="font-size: 16px;"><strong>ราคาสุทธิ:</strong> {{ receipt.netPrice }}</p>
          <p style="font-size: 16px;"><strong>เงินทอน:</strong> {{ receipt.change }}</p>
        </div>
      </div>
      <p>-----------------------------</p>
    </section>
  
    <!-- รายละเอียดใบเสร็จ QR Code -->
    <section>
      <h3 style="font-size: 20px;" class="mb-1">รายละเอียดใบเสร็จที่ชำระด้วยการแสกน QR Code</h3>
      
      <div v-for="(report, index) in reportStore.receipts" :key="'qrcode-' + index" class="qrcode-receipt-details">
        <h4 style="font-size: 16px;">รหัสพนักงาน: {{ report.cashierId }}</h4>
        <div class="no-data-message" v-if="reportStore.receipts.every(report => report.qrcode.length === 0)" style="color: red;">
          ยังไม่มีข้อมูล
        </div>
        <div v-for="(receipt, i) in report.qrcode" :key="'qrcode-receipt-' + i">
          <p style="font-size: 16px;"><strong>เวลาที่ขาย:</strong> {{ receipt.saleTime }}</p>
          <p style="font-size: 16px;"><strong>จำนวนเงิน:</strong> {{ receipt.totalPrice }}</p>
          <p style="font-size: 16px;"><strong>ราคาสุทธิ:</strong> {{ receipt.netPrice }}</p>
          <p style="font-size: 16px;"><strong>เงินทอน:</strong> {{ receipt.change }}</p>
        </div>
      </div>
    </section>
  </div>
</template>


  
  
  <script lang="ts" setup>
  import { useReceiptReportStore } from '@/stores/report_receipt.store';
  import { onMounted } from 'vue';
  import * as XLSX from 'xlsx';
  const reportStore = useReceiptReportStore();
  onMounted(async () => {

      await reportStore.fetchReceipts(); 


  });
  const exportToExcel = () => {
  const reportData = reportStore.receipts.map(report => ({
    'วันที่ เวลา ที่เปิดการขาย': report.openedDate,
    'วันที่ เวลา ที่ปิดการขาย': report.closedDate,
    'พนักงานที่เปิดการขาย': report.openedBy,
    'พนักงานที่ปิดการขาย': report.closedBy,
    'ยอดรวมเงินสดที่ได้รับ': report.cashTotal,
    'ยอดรวมเงินโอนที่ได้รับ': report.qrcodeTotal,
  }));

  // Prepare the cash details
  const cashDetails = [];
  reportStore.receipts.forEach(report => {
    report.cash.forEach(cash => {
      cashDetails.push({
        'เวลาที่ขาย': cash.saleTime,
        'จำนวนเงิน': cash.totalPrice,
        'Net Price': cash.netPrice,
        'จำนวนเงินทอน': cash.change,
      });
    });
  });

  // Prepare the QR code details
  const qrCodeDetails = [];
  reportStore.receipts.forEach(report => {
    report.qrcode.forEach(qr => {
      qrCodeDetails.push({
        'เวลาที่ขาย': qr.saleTime,
        'จำนวนเงิน': qr.totalPrice,
        'Net Price': qr.netPrice,
        'จำนวนเงินทอน': qr.change,
      });
    });
  });

  // Create a workbook and add the worksheets
  const workbook = XLSX.utils.book_new();
  const reportSheet = XLSX.utils.json_to_sheet(reportData);
  const cashSheet = XLSX.utils.json_to_sheet(cashDetails);
  const qrCodeSheet = XLSX.utils.json_to_sheet(qrCodeDetails);

  // Add sheets to the workbook
  XLSX.utils.book_append_sheet(workbook, reportSheet, 'Receipt Reports');
  XLSX.utils.book_append_sheet(workbook, cashSheet, 'Cash Details');
  XLSX.utils.book_append_sheet(workbook, qrCodeSheet, 'QR Code Details');

  // Export the workbook as an Excel file
  XLSX.writeFile(workbook, 'Receipt_Report.xlsx');
};
  </script>
  
  <style scoped>
  .no-data-message {
  color: red;
  font-size: 16px;
}
</style>