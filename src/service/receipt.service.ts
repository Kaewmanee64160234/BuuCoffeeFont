import type { Receipt } from "@/types/receipt.type";
import http from "./axios";

function getAllReceipts() {
  return http.get("/receipts");
}
function getReceiptById(id: number) {
  return http.get(`/receipts/${id}`);
}
function createReceipt(receipt : Receipt) {

console.log("receipt", JSON.stringify(receipt));
  return http.post("/receipts", receipt);
}
function updateReceipt(id: number, receipt: Receipt) {
  return http.put(`/receipts/${id}`, receipt);
}
function deleteReceipt(id: number) {
  return http.delete(`/receipts/${id}`);
}

export default {
  getAllReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt
};
