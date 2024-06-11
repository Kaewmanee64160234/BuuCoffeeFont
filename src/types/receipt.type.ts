// receipt.type.ts
import type { Customer } from './customer.type';
import type { Product } from './product.type';
import type { ProductTypeTopping } from './productTypeTopping.type';
import type { Promotion } from './promotion.type';
import type { Topping } from './topping.type';
import type { User } from './user.type';

export interface ReceiptItem {
  productTypeToppings:ProductTypeTopping[];
  quantity: number;
  subTotal: number;
  product?:Product;
  sweetness?: number;


}

export interface Receipt {
  receiptId?: number;
  totalPrice: number;
  receiptType: string;
  totalDiscount: number;
  netPrice: number;
  receiptStatus: string;
  createdReceipt: Date;
  customer?: Customer;
  user?: User;
  receiptItems: ReceiptItem[];
  promotion?: Promotion;
}
