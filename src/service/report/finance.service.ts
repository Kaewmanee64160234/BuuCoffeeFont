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
  return http.post("/cashiers", cashier);
}
function getAll() {
  return http.get("/cashiers");
}
function getDailyReport() {
  return http.get("/receipts/daily-report?receiptType=ร้านกาแฟ");
}
function getDailyReportFood() {
  return http.get("/receipts/daily-report?receiptType=ร้านข้าว");
}
function getSumType() {
  return http.get("/receipts/sum");
}
function deleteCashier(id: number) {
  return http.delete(`/cashiers/${id}`);
}
function getGroupedFinance(startDate: string, endDate: string) {
  return http.get(`/receipts/grouped?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&receiptType=${encodeURIComponent('ร้านกาแฟ')}`);
}
function getGroupedFinanceFood(startDate: string, endDate: string) {
  return http.get(`/receipts/grouped?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&receiptType=${encodeURIComponent('ร้านข้าว')}`);
}
function getTopSellingProducts(date: string) {
  return http.get(`/receipts/top-selling-products?date=${date}`);
}
function getRevenue() {
  return http.get("/importingredients/revenue");
}
function getExpenditure() {
  return http.get("/importingredients/expenditure");
}
export default {
  getfindToday,
  getGroupedFinanceFood,
  createCashier,
  getAll,
  getDailyReport,
  getDailyReportFood,
  getGroupedFinance,
  getSumType,
  deleteCashier,
  getRevenue,
  getExpenditure,
  getTopSellingProducts

};
