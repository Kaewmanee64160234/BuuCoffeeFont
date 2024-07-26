import http from "../axios";

export function getReceiptsQuery(startDate: string, endDate: string, receiptType: string) {
  return http.get(`/receipts/query-date?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&receiptType=${encodeURIComponent(receiptType)}`);
}
export default {
  getReceiptsQuery

};
