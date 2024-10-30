
import type { CashierReport } from "@/types/report.type";
import http from "../axios";


  export function getReceipts(): Promise<CashierReport[]> {
    return http.get("/receipts/type-report").then(response => response.data);
  }

export default {
  getReceipts,
};
