import type { Receipt } from "@/types/receipt.type";
import http from "./axios";

function getAllReceipts() {
  return http.get("/receipts");
}

function getReceiptById(id: number) {
  return http.get(`/receipts/${id}`);
}

function createReceipt(receipt : Receipt,checkStockId?:number) {
console.log("receipt", JSON.stringify(receipt));

  return http.post("/receipts", {...receipt,checkStockId:checkStockId
    
  });
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

// cancelReceipt


function cancelReceipt(id: number) {
  return http.delete(`/receipts/cancel/${id}`);
}

// in-30-min getRecieptIn30Min
// add qury typeOfProduct

function getRecieptIn30Min(typeOfProduct: string) {
  return http.get(`/receipts/receipt-in-1-day`, {
    params: {
      typeOfProduct,
    },
  }
  );
}

// getRecieptCateringIn24Hours
function getRecieptCateringIn24Hours() {
  return http.get(`/receipts/receipt-catering-in-24-hours`);
}

//  getReceiptPaginate by add query page and size
function getReceiptPaginate(page: number, size: number,search : string) {
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
