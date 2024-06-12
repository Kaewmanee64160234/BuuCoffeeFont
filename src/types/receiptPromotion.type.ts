// models/ReceiptPromotion.ts

import type { Promotion } from "./promotion.type";
import type { Receipt } from "./receipt.type";

export interface ReceiptPromotion {
  receiptPromotionId?: number;
  promotion: Promotion;
  discount?: number;
  date: Date;
}
