import { reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import { mapToProduct, type Product } from "@/types/product.type";
import productService from "@/service/product.service";
import type { Category } from "@/types/category.type";
import { useCategoryStore } from "./category.store";
import type {
  IngredientQuantities,
  ProductType,
} from "@/types/productType.type";
import { useUserStore } from "./user.store";

export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>([]);
  const updateProductDialog = ref(false);
  const createProductDialog = ref(false);
  const searchQuery = ref<string>("");
  const searchQueryPos = ref<string>("");
  const ProductTypes = ref<ProductType[]>([]);
  const editedProduct = ref<Product & { file: File }>({
    productId: 0,
    productName: "",
    productPrice: 0,
    productImage: "",
    countingPoint: false,
    barcode: "",
    storeType: "",
    category: {
      categoryId: 0,
      categoryName: "",

      haveTopping: false,
    },
    file: new File([""], "filename"),
    productTypes: [],
  });

  const product = ref<Product & { file: File }>({
    productId: 0,
    productName: "",
    productPrice: 0,
    barcode: "",
    productImage: "",
    storeType: "",

    countingPoint: false,
    category: {
      categoryId: 0,
      categoryName: "",
      haveTopping: false,
    },
    file: new File([""], "filename"),
    productTypes: [],
  });
  const userStore = useUserStore();
  const productName = ref<string>("");
  const productPrice = ref<number>(0);
  const selectedCategory = ref<string | null>(null);
  const selectedCategoryForUpdate = ref<string | null>(null);
  const imagePreview = ref<string | null>(null);
  const countingPoint = ref(false);

  const selectedIngredientsHot = ref<number[]>([]);
  const selectedIngredientsCold = ref<number[]>([]);
  const selectedIngredientsBlend = ref<number[]>([]);
  const ingredientQuantitiesHot = ref<IngredientQuantities>({});
  const ingredientQuantitiesCold = ref<IngredientQuantities>({});
  const ingredientQuantitiesBlend = ref<IngredientQuantities>({});
  const productTypePriceHot = ref(0);
  const productTypePriceCold = ref(0);
  const productTypePriceBlend = ref(0);
  const productTypes = ref<ProductType[]>([]);
  const isHot = ref<boolean>(false);
  const isCold = ref<boolean>(false);
  const isBlend = ref<boolean>(false);
  const selectedProduct = ref<Product>();
  const barcode = ref("");
  const storeName = ref("");

  const totalProducts = ref(0);
  const currentPage = ref(1);
  const itemsPerPage = ref(5);

  const categoryStore = useCategoryStore();

  // watch if selectedCategory
  watch(selectedCategory, (newCategory) => {
    console.log("selectedCategory", selectedCategory.value);
    if (newCategory) {
      if (newCategory === "ทั้งหมด") {
        console.log("selectedCategory====");
        getProductPaginate();
      }
      if (newCategory !== 1) {
        console.log(" selectedCategory___", newCategory);
        getProductsByCategory(newCategory);
      }
    }
  });

  // watch productStore.currentPage
  watch([currentPage, itemsPerPage, searchQuery], () => {
    getProductPaginate();
  });

  // setSelectedProduct
  const setSelectedProduct = (product: Product) => {
    selectedProduct.value = product;
  };

  const getAllProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.status === 200) {
        console.log(response.data);
        //  use map to Product with array products
        products.value = response.data.map((product: any) =>
          mapToProduct(product)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  // getproduct pageginate
  const getProductPaginate = async () => {
    try {
      const response = await productService.getProductPaginate(
        currentPage.value,
        itemsPerPage.value,
        searchQuery.value
      );
      console.log("getProductPaginate", response.data);
      if (response.status === 200) {
        products.value = response.data.data.map((product: any) =>
          mapToProduct(product)
        );
        console.log("products", products.value);
        totalProducts.value = response.data.total;
      }
    } catch (error) {
      // console.error(error);
      console.log("error", error);
    }
  };

  const getProductById = async (id: number) => {
    try {
      const response = await productService.getProductById(id);
      if (response.status === 200) {
        product.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createProduct = async () => {
    try {
      const response = await productService.createProduct(product.value!);
      if (response.status === 201) {
        if (product.value.file !== null) {
          await uploadImage(product.value.file, response.data.productId);
        }
        await getProductPaginate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async (id: number, updatedProduct_: Product) => {
    try {
      await getProductById(id);
      // map new data and old data
      const updatedProduct = {
        ...product.value,
        ...editedProduct.value,
      };
  
      // Check if there is a new file before attempting to update the image
      if (editedProduct.value.file && editedProduct.value.file.name) {
        const formData = new FormData();
        formData.append("file", editedProduct.value.file);
        await updateImageProduct(id, formData);
      }
  
      // Check for changes in various fields
      const productNameChanged =
        editedProduct.value.productName !== product.value.productName;
      const productPriceChanged =
        editedProduct.value.productPrice !== product.value.productPrice;
      const categoryChanged =
        editedProduct.value.category.categoryName !== product.value.category.categoryName;
      const productTypesChanged =
        JSON.stringify(editedProduct.value.productTypes) !== JSON.stringify(product.value.productTypes);
      const countingPointChanged =
        editedProduct.value.countingPoint !== product.value.countingPoint;
      const storeTypeChanged = 
        editedProduct.value.storeType !== product.value.storeType;
  
      // Update only if there are changes
      if (
        productNameChanged ||
        productPriceChanged ||
        categoryChanged ||
        productTypesChanged ||
        countingPointChanged ||
        storeTypeChanged
      ) {
        const response = await productService.updateProduct(id, updatedProduct);
        console.log("updateProduct", response.status);
      }
  
      await getProductPaginate();
    } catch (error) {
      console.error(error);
    }
  };
  

  const deleteProduct = async (id: number) => {
    try {
      const response = await productService.deleteProduct(id);
      await getAllProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImage = async (file: File, productId: number) => {
    try {
      const response = await productService.uploadImage(file, productId);
      if (response.status === 201) {
        console.log("uploadImage", response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProductsByCategory = async (category: string) => {
    try {
      const response = await productService.getProductsByCategory(category);
      if (response.status === 200) {
        products.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // updateImageProduct

  const updateImageProduct = async (productId: number, formData: FormData) => {
    try {
      const response = await productService.updateImageProduct(
        productId,
        formData
      );
      if (response.status === 201) {
        console.log("updateImageProduct", response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    products,
    product,
    productName,
    productPrice,
    selectedCategory,
    imagePreview,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    searchQuery,
    getProductsByCategory,
    createProductDialog,
    updateProductDialog,
    selectedIngredientsHot,
    selectedIngredientsCold,
    selectedIngredientsBlend,
    ingredientQuantitiesHot,
    ingredientQuantitiesCold,
    ingredientQuantitiesBlend,
    productTypes,
    isHot,
    isCold,
    isBlend,
    updateImageProduct,
    getProductPaginate,
    totalProducts,
    currentPage,
    itemsPerPage,
    selectedProduct,
    setSelectedProduct,
    searchQueryPos,
    editedProduct,
    selectedCategoryForUpdate,
    ProductTypes,
    productTypePriceHot,
    productTypePriceCold,
    productTypePriceBlend,
    barcode,
    storeName,
    countingPoint
  };
});
