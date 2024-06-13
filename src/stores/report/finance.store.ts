import { ref } from "vue";
import { defineStore } from "pinia";
import financeService from "@/service/report/finance.service";
import type { Cashier } from "@/types/report/cashier.type";
export const useReportFinnceStore = defineStore("cashier", () => {
  const cashiers = ref<Cashier[]>([]);
  const createCashierDialog = ref(false);
  const createHistoryCashierDialog = ref(false);
  const historycashiers = ref<Cashier[]>([]);
  const sumType = ref<{ cash: string; qrcode: string }>({ cash: "", qrcode: "" });
  const dailyReport = ref<{ totalSales: number; totalDiscount: number ; totalTransactions: number}>({ totalSales: 0, totalDiscount: 0, totalTransactions:0});
  const createCashier = async (cashier: Cashier) => {
    try {
      const res = await financeService.createCashier(cashier);
      if (res.data) {
        cashiers.value.push(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getfindToday = async () => {
    try {
      const res = await financeService.getfindToday();
      if (res.data) {
        cashiers.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getAll = async () => {
    try {
      const res = await financeService.getAll();
      if (res.data) {
        historycashiers.value = res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const deleteCashier = async (id: number) => {
    try {
      await financeService.deleteCashier(id);
      cashiers.value = cashiers.value.filter((c) => c.cashierId !== id);
    } catch (error) {
      console.error(error);
    }
  };
  const getSumType = async () => {
    try {
      const res = await financeService.getSumType();
      if (res.data) {
        sumType.value = res.data;
        console.log(sumType.value)
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getDailyReport = async () => {
    try {
      const res = await financeService.getDailyReport();
      if (res.data) {
        dailyReport.value = res.data;
        console.log(dailyReport.value)
      }
    } catch (error) {
      console.error(error);
    }
  };
  return {
    cashiers,
    createCashierDialog,
    createHistoryCashierDialog,
    historycashiers,
    sumType,
    dailyReport,
    getfindToday,
    deleteCashier,
    getAll,
    getSumType,
    getDailyReport,
    createCashier,
    
  };
});
