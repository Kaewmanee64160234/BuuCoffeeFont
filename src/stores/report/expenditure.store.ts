import { defineStore } from 'pinia';
import financeService from '@/service/report/finance.service';

export const useExpenditureStore = defineStore('expenditure', {
  state: () => ({
    startDate: '',
    endDate: '',
    totalExpenditureStartDate: 0,
    totalExpenditureEndDate: 0,
  }),
  actions: {
    async fetchExpenditure() {
      try {
        const res = await financeService.getExpenditure();
        if (res.data) {
          this.startDate = res.data.startDate;
          this.endDate = res.data.endDate;
          this.totalExpenditureStartDate = res.data.totalExpenditureStartDate;
          this.totalExpenditureEndDate = res.data.totalExpenditureEndDate;
        }
      } catch (error) {
        console.error('Error fetching expenditure:', error);
      }
    },
  },
});
