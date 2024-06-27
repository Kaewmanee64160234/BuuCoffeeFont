import { defineStore } from "pinia";
import financeService from "@/service/report/finance.service";

export const useRevenueStore = defineStore("revenue", () => ({
  receipts: [] as { receiptNetPrice: number; date: string }[],
  totalRevenue: 0,

  async fetchRevenue() {
    try {
      const res = await financeService.getRevenue();
      if (res.data) {
        this.receipts = res.data.receipts;
        this.totalRevenue = res.data.totalRevenue;
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  },
}));
