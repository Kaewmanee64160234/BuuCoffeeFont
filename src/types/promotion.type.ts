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
  }
  