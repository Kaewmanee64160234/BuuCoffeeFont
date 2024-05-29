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
function uploadImage(file: File,productId:number) {
  const formData = new FormData();
  formData.append("image", file);
  return http.post(`/upload/${productId}`, formData);
}

// get product by category name
function getProductsByCategory(category: string) {
  return http.get(`/products/category/${category}`);
}

//get image product
function getImageProduct(id: number) {
  return http.get(`/products/${id}/image/`);
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductsByCategory,
  getImageProduct
};
