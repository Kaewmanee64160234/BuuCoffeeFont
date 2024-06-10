import type { Customer } from "./customer.type";
import type { ProductTypeTopping } from "./productTypeTopping.type";
import type { ReceiptPromotion } from "./receiptPromotion.type";
import type { User } from "./user.type";

export interface Reciept {
    receiptId: number;
    receiptTotalPrice: number;
    receiptTotalDiscount: number;
    receiptNetPrice: number;
    receiptStatus: string;
    receiptType: string;
    storeStatus: string;
    receiptItems: ReceiptItem[];
    user: User;
    customer: Customer;
    receiptPromotions: ReceiptPromotion[];
  }
export interface ReceiptItem {
    receiptItemId: number;
    quantity: number;
    receiptSubTotal: number;
    reciept: Reciept;
    user: User;
    productTypeToppings: ProductTypeTopping[];
  }
