// models/ReceiptPromotion.ts

import type { Promotion } from "./promotion.type";
import type { Reciept } from "./recipt.type";

export interface ReceiptPromotion {
  receiptPromId: number;
  receipt: Reciept;
  promotion: Promotion;
  discount: number;
  date: Date;
}
