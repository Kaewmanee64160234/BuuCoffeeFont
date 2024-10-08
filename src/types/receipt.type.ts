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
  receive: number;
  change: number;
  customer?: Customer;
  user?: User;
  receiptItems: ReceiptItem[];
  promotion?: Promotion;
  paymentMethod?: string;
  checkIngredientId:number;
  receiptNumber?: number;
  receiptPromotions:ReceiptPromotion[];
  createdDate: Date;
  updatedDate: Date;
}

export function mapToReceipt(data: any): Receipt {
  return {
    receiptId: data.receiptId,
    receiptTotalPrice: data.receiptTotalPrice,
    receiptType: data.receiptType,
    receiptTotalDiscount: data.receiptTotalDiscount,
    receiptNetPrice: data.receiptNetPrice,
    receiptStatus: data.receiptStatus,
    queueNumber: data.queueNumber,
    receive: data.receive,
    change: data.change,
    customer: data.customer, // หรือนิยาม mapToCustomer ถ้าจำเป็น
    user: data.user, // หรือนิยาม mapToUser ถ้าจำเป็น
    receiptItems: data.receiptItems.map((item: any) => ({
      productTypeToppings: item.productTypeToppings,
      quantity: item.quantity,
      receiptSubTotal: item.receiptSubTotal,
      product: item.product,
      sweetnessLevel: item.sweetnessLevel,
      receiptItemId: item.receiptItemId,
      productType: item.productType,
    })),
    promotion: data.promotion, // หรือนิยาม mapToPromotion ถ้าจำเป็น
    paymentMethod: data.paymentMethod,
    checkIngredientId: data.checkIngredientId,
    receiptNumber: data.receiptNumber,
    receiptPromotions: data.receiptPromotions, // หรือนิยาม mapToReceiptPromotion ถ้าจำเป็น
    createdDate: new Date(data.createdDate), // แปลงเป็น Date object
    updatedDate: new Date(data.updatedDate), // แปลงเป็น Date object
  };
}
