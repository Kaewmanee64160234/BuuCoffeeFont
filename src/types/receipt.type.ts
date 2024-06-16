// receipt.type.ts
import type { Customer } from './customer.type';
import type { Product } from './product.type';
import type { ProductType } from './productType.type';
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
  productType?: ProductType;

}


export interface Receipt {
  receiptId?: number;
  receiptTotalPrice: number;
  receiptType: string;
  receiptTotalDiscount: number;
  receiptNetPrice: number;
  receiptStatus: string;
  queueNumber: number;
  customer?: Customer;
  user?: User;
  receiptItems: ReceiptItem[];
  promotion?: Promotion;
  paymentMethod?: string;
  receiptPromotions:ReceiptPromotion[];
  createdDate: Date;
  updatedDate: Date;
}
