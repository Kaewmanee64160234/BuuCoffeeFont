export interface ProductUsage {
    productName: string;
    productTypeName: string;
    usageCount: number;
    totalQuantity: number;
  }
  
  export interface FinanceState {
    productsUsage: ProductUsage[];
  }