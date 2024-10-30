export interface ReceiptReport {
    saleTime: string; 
    totalPrice: string; 
    netPrice: string; 
    change: string; 
  }
  
  export interface CashierReport {
    cashierId: number; 
    openedDate: string; 
    closedDate: string; 
    cashierAmount: number; 
    closedAmount: number; 
    openedBy: string; 
    closedBy: string; 
    cash: ReceiptReport[]; 
    qrcode: ReceiptReport[]; 
    cashTotal: number; 
    qrcodeTotal: number; 
  }