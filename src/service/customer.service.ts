import type { Customer } from "@/types/customer.type";
import http from "./axios";

function getAllCustomers() {
  return http.get("/customers");
}
function getCustomerById(id: number) {
  return http.get(`/customers/${id}`);
}
function createCustomer(user: Customer) {
  return http.post("/customers", user);
}
function updateCustomer(id: number, user: Customer) {
  return http.patch(`/customers/${id}`, user);
}
function deleteCustomer(id: number) {
  return http.delete(`/customers/${id}`);
}
function searchCustomers(query: string) {
  return http.get(`/customers/search`, {
    params: {
      query,
    },
  });
}

//  getProductPaginate by add query page and size
function getCustomerPaginate(page: number, size: number,search : string) {
  return http.get(`/customers/paginate`, {
    params: {
      page,
      limit: size,
      search
    }
  });

}
export default {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerPaginate
};
