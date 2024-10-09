// src/interfaces/Promotion.ts
export interface Promotion {
  promotionId: number;
  promotionName: string;
  promotionDescription?: string;
  promotionType: string;
  discountValue?: number;
  conditionQuantity?: number;
  buyProductId?: number;
  freeProductId?: number;
  conditionValue1?: number;
  conditionValue2?: number;
  startDate: Date;
  endDate?: Date;
  noEndDate: boolean;
  promotionForStore: string;
  promotionCanUseManyTimes: boolean;
  }

  export function mapToPromotion(data: any): Promotion {
    return {
      promotionId: data.promotionId,
      promotionName: data.promotionName,
      promotionDescription: data.promotionDescription,
      promotionType: data.promotionType,
      discountValue: data.discountValue,
      conditionQuantity: data.conditionQuantity,
      buyProductId: data.buyProductId,
      freeProductId: data.freeProductId,
      conditionValue1: data.conditionValue1,
      conditionValue2: data.conditionValue2,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      noEndDate: data.noEndDate,
      promotionForStore: data.promotionForStore,
      promotionCanUseManyTimes: data.promotionCanUseManyTimes,
    };
  }
  
  