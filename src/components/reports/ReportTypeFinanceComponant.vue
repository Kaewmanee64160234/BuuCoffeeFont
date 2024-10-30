
<template>
  <div>
    <h2>Receipt Reports</h2>
    <button @click="exportToExcel">Export to Excel</button>
    <div v-for="(report, index) in reportStore.receipts" :key="index">
      <h3>รายงานยอดขาย</h3>
      <p>วันที่เปิดการขาย: {{ report.openedDate }}</p>
      <p>วันที่ปิดการขาย: {{ report.closedDate }}</p>
      <p>จำนวนเงินสดเปิดการขาย: {{ report.openingCash }} บาท</p>
      <p>จำนวนเงินสดปิดการขาย: {{ report.closingCash }} บาท</p>
      <p>เปิดการขายโดย: {{ report.openedBy }}</p>
      <p>ปิดการขายโดย: {{ report.closedBy }}</p>
      <hr />
    
      <h3>รายละเอียดการชำระเงินสด</h3>
      <div v-for="(receipt, i) in report.cash" :key="'cash-' + i">
        <p>เวลาในการขาย: {{ receipt.saleTime }}</p>
        <p>ยอดรวม: {{ receipt.totalPrice }} บาท</p>
        <p>ยอดสุทธิ: {{ receipt.netPrice }} บาท</p>
        <p>เงินทอน: {{ receipt.change }} บาท</p>
      </div>
      <hr />
    
      <h3>รายละเอียดการชำระเงินโอน</h3>
      <div v-for="(receipt, i) in report.qrcode" :key="'qr-' + i">
        <p>เวลาในการขาย: {{ receipt.saleTime }}</p>
        <p>ยอดรวม: {{ receipt.totalPrice }} บาท</p>
        <p>ยอดสุทธิ: {{ receipt.netPrice }} บาท</p>
        <p>เงินทอน: {{ receipt.change }} บาท</p>
      </div>
      <hr />
    
      <h3>สรุปยอดขาย</h3>
      <p>ยอดรวมเงินสดที่ขายได้: {{ report.cashTotal }} บาท</p>
      <p>ยอดรวมเงินโอนที่ได้รับ: {{ report.qrcodeTotal }} บาท</p>
    </div>
    
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
  