import type { Product } from "@/types/product.type";
import http from "./axios";

function getAllProducts() {
  return http.get("/products");
}
function getProductById(id: number) {
  return http.get(`/products/${id}`);
}

function createProduct(product: any & { file: File }) {
  console.log(product.file);

  const formData = new FormData();

  // Append simple fields
  formData.append("productName", product.productName);
  formData.append("productPrice", product.productPrice.toString());
  formData.append("categoryId", product.categoryId);
  formData.append("barcode", product.barcode || "");
  formData.append("storeType", product.storeType);
  formData.append("countingPoint", product.countingPoint?.toString() || "");
  formData.append("haveTopping", product.haveTopping.toString());
  formData.append("needLinkIngredient", product.needLinkIngredient.toString());

  // Append product image file if it exists
  if (product.file) {
    formData.append("imageFile", product.file, product.file.name);
  }

  // If product types exist, map them and append to FormData
  if (product.productTypes!.length > 0) {
    product.productTypes!.forEach(
      (
        productType: {
          productTypeName: string | Blob;
          productTypePrice: { toString: () => string | Blob };
        },
        index: any
      ) => {
        formData.append(
          `productTypes[${index}][productTypeName]`,
          productType.productTypeName
        );
        formData.append(
          `productTypes[${index}][productTypePrice]`,
          productType.productTypePrice.toString()
        );

        // Handle recipes if available
        // if (productType.recipes?.length) {
        //   productType.recipes.forEach((recipe, recipeIndex) => {
        //     formData.append(`productTypes[${index}][recipes][${recipeIndex}][ingredientId]`, recipe.ingredient.ingredientId.toString());
        //     formData.append(`productTypes[${index}][recipes][${recipeIndex}][quantity]`, recipe.quantity.toString());
        //   });
        // }
      }
    );
  }
  if (product.haveTopping === false && product.needLinkIngredient === true) {
    formData.append("ingredient[ingredientName]", product.ingredient.ingredientName || "");
  formData.append("ingredient[ingredientSupplier]", product.ingredient.ingredientSupplier || "");
  formData.append("ingredient[ingredientMinimun]", `${product.ingredient.ingredientMinimun}`);
  formData.append("ingredient[ingredientUnit]", product.ingredient.ingredientUnit || "");
  formData.append(
    "ingredient[ingredientQuantityPerUnit]",
    `${product.ingredient.ingredientQuantityPerUnit || 0}`
  );
  formData.append(
    "ingredient[ingredientQuantityPerSubUnit]",
    product.ingredient.ingredientQuantityPerSubUnit || ""
  );
  formData.append("ingredient[ingredientBarcode]", product.ingredient.ingredientBarcode || "");
  formData.append("ingredient[ingredientVolumeUnit]", product.ingredient.ingredientVolumeUnit || "");


  }
  // Log FormData for debugging (optional)
  for (const pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  // Send the form data using an HTTP POST request
  return http.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function updateProduct(id: number, product: Product & { file: File }) {
  console.log("Product:", product);
  
  const formData = new FormData();
  console.log("File:", product.file);

  // Append simple fields to formData
  formData.append("productName", product.productName);
  formData.append("productPrice", product.productPrice.toString());
  formData.append("barcode", product.barcode || "");
  formData.append("storeType", product.storeType);
  formData.append("countingPoint", product.countingPoint ? "true" : "false");
  formData.append("haveTopping", product.haveTopping ? "true" : "false");
  formData.append("categoryId", product.category.categoryId.toString());

  // Append product types if they exist
  if (product.productTypes && product.productTypes.length > 0) {
    product.productTypes.forEach((productType, index) => {
      formData.append(
        `productTypes[${index}][productTypeName]`,
        productType.productTypeName
      );
      formData.append(
        `productTypes[${index}][productTypePrice]`,
        productType.productTypePrice.toString()
      );
    });
  }

  // // Append product image if it exists
  if (product.file) {
    formData.append("imageFile", product.file, product.file.name);
  }

  // Send the form data using PATCH request
  return http.patch(`/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

// update-image/:productId
function updateImageProduct(productId: number, formData: FormData) {
  return http.post(`/products/update-image/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// getProductByStoreType
function getProductByStoreType(storeType: string) {
  return http.get(`/products/store-type/${storeType}`);
}

//  getProductPaginate by add query page and size
function getProductPaginate(page: number, size: number, search: string) {
  return http.get(`/products/paginate`, {
    params: {
      page,
      limit: size,
      search,
    },
  });
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
  updateImageProduct,
  getProductPaginate,
  getProductByStoreType,
};
