import type { Receipt } from "@/types/receipt.type";
import http from "./axios";

function getAllReceipts() {
  return http.get("/receipts");
}

function getReceiptById(id: number) {
  return http.get(`/receipts/${id}`);
}

function createReceipt(receipt: Receipt, checkStockId?: number) {
  console.log("receipt", JSON.stringify(receipt));
  return http.post("/receipts", { ...receipt, checkStockId: checkStockId });
}

function updateReceipt(id: number, receipt: Receipt) {
  return http.patch(`/receipts/${id}`, receipt);
}

function deleteReceipt(id: number) {
  return http.delete(`/receipts/cancel/${id}`);
}

function removeReceipt(id: number) {
  return http.delete(`/receipts/${id}`);
}

function cancelReceipt(id: number) {
  return http.delete(`/receipts/cancel/${id}`);
}

function getRecieptIn30Min(typeOfProduct: string) {
  return http.get(`/receipts/receipt-in-1-day`, {
    params: {
      typeOfProduct,
    },
  });
}

function getRecieptCateringIn24Hours() {
  return http.get(`/receipts/receipt-catering-in-24-hours`);
}

function getReceiptPaginate(page: number, size: number, search: string) {
  return http.get(`/receipts/paginate`, {
    params: {
      page,
      limit: size,
      search
    }
  });
}

export default {
  getAllReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  cancelReceipt,
  getRecieptIn30Min,
  getRecieptCateringIn24Hours,
  getReceiptPaginate,
  removeReceipt
};
