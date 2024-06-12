// receipt.type.ts
import type { Customer } from './customer.type';
import type { Product } from './product.type';
import type { ProductTypeTopping } from './productTypeTopping.type';
import type { Promotion } from './promotion.type';
import type { ReceiptPromotion } from './receiptPromotion.type';
import type { Topping } from './topping.type';
import type { User } from './user.type';

export interface ReceiptItem {
  productTypeToppings:ProductTypeTopping[];
  quantity: number;
  receiptSubTotal: number;
  product?:Product;
  sweetnessLevel?: number;
  receiptItemId?: number;


}

export interface Receipt {
  receiptId?: number;
  receiptTotalPrice: number;
  receiptType: string;
  receiptTotalDiscount: number;
  receiptNetPrice: number;
  receiptStatus: string;
  createdReceipt: Date;
  customer?: Customer;
  user?: User;
  receiptItems: ReceiptItem[];
  promotion?: Promotion;
  paymentMethod?: string;
  receiptPromotions:ReceiptPromotion[];
}
