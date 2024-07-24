export interface PromotionUsage {
    promotionName: string;
    usageCount: number;
    totalDiscount: number;
  }
  
  export interface PromotionsUsageResponse {
    promotionsUsage: PromotionUsage[];
  }
  