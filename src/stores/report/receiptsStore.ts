import { defineStore } from 'pinia';
import receipttoXlsService from '@/service/report/receiptsquery.service';
import * as XLSX from 'xlsx';

export const useReceiptsStore = defineStore('receipts', {
  state: () => ({
    receipts: [] as any[],
  }),
  actions: {
    async fetchReceipts(startDate: string, endDate: string, receiptType: string) {
      try {
        const response = await receipttoXlsService.getReceiptsQuery(startDate, endDate, receiptType);
        this.receipts = response.data;
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    },
    exportToExcel() {
        const worksheet = XLSX.utils.json_to_sheet(this.receipts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts');
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'receipts.xlsx';
        link.click();
      },
    },
  });
  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }