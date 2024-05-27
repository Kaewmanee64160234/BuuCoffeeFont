import type { Product } from "@/types/product.type";
import http from "./axios";

function getAllProducts() {
  return http.get("/products");
}
function getProductById(id: number) {
  return http.get(`/products/${id}`);
}
function createProduct(product: Product) {
  return http.post("/products", product);
}
function updateProduct(id: number, product: Product) {
  return http.put(`/products/${id}`, product);
}
function deleteProduct(id: number) {
  return http.delete(`/products/${id}`);
}
function uplodeImage(file: File,productId:number) {
  const formData = new FormData();
  formData.append("image", file);
  return http.post(`/upload/${productId}`, formData);
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uplodeImage
};
