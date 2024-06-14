import { defineStore } from "pinia";
import financeService from "@/service/report/finance.service";

export const useExpenditureStore = defineStore("expenditure", () => ({
  startDate: "",
  endDate: "",
  totalExpenditure: 0,

  async fetchExpenditure() {
    try {
      const res = await financeService.getExpenditure();

          if (res.data) {
            this.startDate = res.data.startDate;
            this.endDate = res.data.endDate;
            this.totalExpenditure = res.data.totalExpenditure;
          }
        } catch (error) {
          console.error("Error fetching revenue:", error);
        }
      },
    }));