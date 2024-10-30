
<template>
  <div>
    <h2>Receipt Reports</h2>
    <table>
      <thead>
        <tr>
          <th>Cashier ID</th>
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
          <td>{{ report.cashierId }}</td>
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
  
  const reportStore = useReceiptReportStore();
  
  onMounted(async () => {
    try {
      await reportStore.fetchReceipts(); // Ensure this function is called
      console.log('Receipts fetched:', reportStore.receipts);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
    console.log('Test');
    console.log('Last');
  });
  </script>
  