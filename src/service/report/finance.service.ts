import type { Cashier } from "@/types/report/cashier.type";
import http from "../axios";

async function getfindToday() {
  try {
    return await http.get("/cashiers/today");
  } catch (error) {
    if (error instanceof Error && error.response && error.response.status === 404) {
      return { data: null }; 
    } else {
      throw error; 
    }
  }
}
export function createCashier(cashier: Cashier) {
  console.log(JSON.stringify(cashier));
  return http.post("/cashiers", cashier);
}
function getAll() {
  return http.get("/cashiers");
}
function getDailyReport() {
  return http.get("/receipts/daily-report");
}
function getSumType() {
  return http.get("/receipts/sum");
}
function deleteCashier(id: number) {
  return http.delete(`/cashiers/${id}`);
}
function getGroupedFinance(startDate: string, endDate: string) {
  return http.get(`/receipts/grouped?startDate=${startDate}&endDate=${endDate}`);
}
export default {
  getfindToday,
  createCashier,
  getAll,
  getDailyReport,
  getGroupedFinance,
  getSumType,
  deleteCashier,

};
