// receipt.type.ts
import type { Customer } from './customer.type';
import type { ProductTypeTopping } from './productTypeTopping.type';
import type { User } from './user.type';

export interface ReceiptItem {
  productTypeToppings:ProductTypeTopping[];
  topping: string;
  type: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  receiptId?: number;
  totalPrice: number;
  receiptType: string;
  totalDiscount: number;
  netPrice: number;
  receiptStatus: string;
  createdReceipt: Date;
  customerId: Customer;
  userId: User;
  items: ReceiptItem[];
  promotion: string;
}
