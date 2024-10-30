import receiptService from '@/service/report/receipttype.service';
import type { CashierReport } from '@/types/report.type';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useReceiptReportStore = defineStore('reportreceipt', () => {
  const receipts = ref<CashierReport[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchReceipts = async () => {
    loading.value = true;
    error.value = null;

    console.log('Fetching receipts...'); // Log before fetching

    try {
      receipts.value = await receiptService.getReceipts();
      console.log('Receipts fetched successfully:', receipts.value); // Log the fetched receipts
    } catch (err) {
      error.value = (err as Error).message || 'An error occurred while fetching receipts.';
      console.error('Error fetching receipts:', error.value); // Log the error message
    } finally {
      loading.value = false;
      console.log('Loading state:', loading.value); // Log the loading state
    }
  };

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
  };
});
