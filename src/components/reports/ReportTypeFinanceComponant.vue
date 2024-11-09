
<template>
  <div>
    <h2>Receipt Reports</h2>
    <button @click="exportToExcel">Export to Excel</button>
    <table>
      <thead>
        <tr>
          <th>Opened Date</th>
          <th>Closed Date</th>
          <th>Opened By</th>
          <th>Closed By</th>
          <th>Cash Total</th>
          <th>QR Code Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(report, index) in reportStore.receipts" :key="index">
          <td>{{ report.openedDate }}</td>
          <td>{{ report.closedDate }}</td>
          <td>{{ report.openedBy }}</td>
          <td>{{ report.closedBy }}</td>
          <td>{{ report.cashTotal }}</td>
          <td>{{ report.qrcodeTotal }}</td>
        </tr>
      </tbody>
    </table>

    <h3>Cash Receipt Details</h3>
    <div v-for="(report, index) in reportStore.receipts" :key="'cash-' + index">
      <h4>Cashier ID: {{ report.cashierId }}</h4>
      <table>
        <thead>
          <tr>
            <th>Sale Time</th>
            <th>Total Price</th>
            <th>Net Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(receipt, i) in report.cash" :key="'cash-receipt-' + i">
            <td>{{ receipt.saleTime }}</td>
            <td>{{ receipt.totalPrice }}</td>
            <td>{{ receipt.netPrice }}</td>
            <td>{{ receipt.change }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>QR Code Receipt Details</h3>
    <div v-for="(report, index) in reportStore.receipts" :key="'qrcode-' + index">
      <h4>Cashier ID: {{ report.cashierId }}</h4>
      <table>
        <thead>
          <tr>
            <th>Sale Time</th>
            <th>Total Price</th>
            <th>Net Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(receipt, i) in report.qrcode" :key="'qrcode-receipt-' + i">
            <td>{{ receipt.saleTime }}</td>
            <td>{{ receipt.totalPrice }}</td>
            <td>{{ receipt.netPrice }}</td>
            <td>{{ receipt.change }}</td>
          </tr>
        </tbody>
      </table>
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
  