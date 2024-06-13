import type { Cashier } from "@/types/report/cashier.type";
import http from "../axios";

async function getfindToday() {
  try {
    return await http.get("/cashiers/today");
  } catch (error) {
    if (error instanceof Error && error.response && error.response.status === 404) {
      return { data: null }; // ถ้าไม่พบข้อมูลให้ส่ง null กลับ
    } else {
      throw error; // ส่งข้อผิดพลาดอื่น ๆ กลับ
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

export default {
  getfindToday,
  deleteCashier,
  getAll,
  getSumType,
  getDailyReport,
  createCashier,
};
