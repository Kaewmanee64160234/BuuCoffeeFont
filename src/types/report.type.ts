export interface ReceiptReport {
  saleTime: string;
  totalPrice: string;
  netPrice: string;
  change: string;
}

export interface CashierShift {
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
  totalSales: number;
}

export interface ShiftTotals {
  totalCash: number;
  totalQR: number;
  total: number;
}

export interface ShiftReport {
  shifts: CashierShift[];
  totals: ShiftTotals;
}

export interface CashierReport {
  startDate: string;
  endDate: string;
  coffee: ShiftReport;
  rice: ShiftReport;
}