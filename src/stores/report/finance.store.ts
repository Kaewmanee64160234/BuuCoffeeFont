import { ref } from "vue";
import { defineStore } from "pinia";
import financeService from "@/service/report/finance.service";
import type { Cashier } from "@/types/report/cashier.type";
export const useReportFinnceStore = defineStore("cashier", () => {
  const cashiers = ref<Cashier[]>([]);
  const createCashierDialog = ref(false);
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
  return {
    cashiers,
    createCashierDialog,
    getfindToday,
  };
});
