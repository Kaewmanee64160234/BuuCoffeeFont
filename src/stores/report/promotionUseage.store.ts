import { ref } from 'vue';
import { defineStore } from 'pinia';
import promotionService from '@/service/report/finance.service';
import type { PromotionsUsageResponse } from '@/types/report/promotionUsage.type';

export const usePromotionsUsageStore = defineStore('promotionsUsage', () => {
    const promotionsUsage = ref<PromotionsUsageResponse['promotionsUsage']>([]);
  
    const loadPromotionsUsage = async (startDate?: string, endDate?: string) => {
      try {
        const start = startDate || '';
        const end = endDate || '';
  
        const res = await promotionService.getPromotionsUsage(start, end);
        console.log('Promotions Usage API response:', res);
        if (res.data) {
          promotionsUsage.value = res.data.promotionsUsage;
        }
      } catch (error) {
        console.error('Failed to load promotions usage', error);
      }
    };
  
    return {
      promotionsUsage,
      loadPromotionsUsage,
    };
  });