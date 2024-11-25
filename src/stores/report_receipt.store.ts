import receiptService from '@/service/report/receipttype.service';
import type { CashierReport, CashierShift, ReceiptReport } from '@/types/report.type';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useReceiptReportStore = defineStore('reportreceipt', () => {
  const receipts = ref<CashierReport[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchReceipts = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await receiptService.getReceipts();
      console.log('API Response:', response);
      
      // แปลง response เป็น CashierReport
      receipts.value = [{
        startDate: new Date(response.startDate),
        endDate: new Date(response.endDate),
        coffee: {
          shifts: response.coffee.shifts.map(shift => ({
            cashierId: shift.cashierId,
            openedDate: new Date(shift.openedDate),
            closedDate: shift.closedDate ? new Date(shift.closedDate) : null,
            cashierAmount: shift.cashierAmount,
            closedAmount: shift.closedAmount,
            openedBy: shift.openedBy,
            closedBy: shift.closedBy,
            cash: shift.cash,
            qrcode: shift.qrcode,
            cashTotal: shift.cashTotal,
            qrcodeTotal: shift.qrcodeTotal,
            totalSales: shift.totalSales
          })),
          totals: response.coffee.totals
        },
        rice: {
          shifts: response.rice.shifts.map(shift => ({
            cashierId: shift.cashierId,
            openedDate: new Date(shift.openedDate),
            closedDate: shift.closedDate ? new Date(shift.closedDate) : null,
            cashierAmount: shift.cashierAmount,
            closedAmount: shift.closedAmount,
            openedBy: shift.openedBy,
            closedBy: shift.closedBy,
            cash: shift.cash,
            qrcode: shift.qrcode,
            cashTotal: shift.cashTotal,
            qrcodeTotal: shift.qrcodeTotal,
            totalSales: shift.totalSales
          })),
          totals: response.rice.totals
        }
      }];
    } catch (err) {
      error.value = (err as Error).message || 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ';
      console.error('Error fetching receipts:', error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
  };
});
