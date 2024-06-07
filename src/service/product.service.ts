import type { Product } from "@/types/product.type";
import http from "./axios";

function getAllProducts() {
  return http.get("/products");
}
function getProductById(id: number) {
  return http.get(`/products/${id}`);
}
function createProduct(product: Product) {
  const product_ = {
    productName: product.productName,
    productPrice: product.productPrice,
    productImage: product.productImage,
    categoryId: product.category.categoryId,
    productTypes:
      product.productTypes?.length! > 0
        ? product.productTypes!.map((productType) => {
            return {
              productTypeName: productType.productTypeName,
              productTypePrice: productType.productTypePrice,
              recipes: productType.recipes?.map((recipe) => {
                return {
                  ingredientId: recipe.ingredient.IngredientId,
                  quantity: recipe.quantity,
                };
              }),
            };
          })
        : [],
  };

  console.log(JSON.stringify(product_));

  return http.post("/products", product_);
}
function updateProduct(id: number, product: Product) {
  return http.patch(`/products/${id}`, product);
}
function deleteProduct(id: number) {
  return http.delete(`/products/${id}`);
}
function uploadImage(file: File, productId: number) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  console.log("FormData Contents:", file);
  return http.post(`/products/upload/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
  getImageProduct,
};
