// models/ReceiptPromotion.ts

import type { Promotion } from "./promotion.type";
import type { Receipt } from "./receipt.type";

export interface ReceiptPromotion {
  receiptPromId: number;
  receipt: Receipt;
  promotion: Promotion;
  discount: number;
  date: Date;
}
