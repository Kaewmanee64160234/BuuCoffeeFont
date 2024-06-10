import { defineStore } from "pinia";
import { ref } from "vue";
import type { Product } from "@/types/product.type";
import type { ProductTypeTopping } from "@/types/productTypeTopping.type";
import type { ReceiptPromotion } from "@/types/receiptPromotion.type";
import type { ReceiptItem } from "@/types/recipt.type";
import type { Receipt } from "@/types/receipt.type";
import type { ProductType } from "@/types/productType.type";
import type { Topping } from "@/types/topping.type";
import { useProductStore } from "./product.store";

export const usePosStore = defineStore("pos", () => {
  const selectedItems = ref<ReceiptItem[]>([]);
  const receiptPromotions = ref<ReceiptPromotion[]>([]);
  const customerPhone = ref<string>("");
  const customerPoints = ref<number>(0);
  const totalDiscount = ref<number>(0);
  const totalPrice = ref<number>(0);
  const netPrice = ref<number>(0);
  const receipt = ref<Receipt>({
    totalPrice: 0,
    receiptType: "",
    totalDiscount: 0,
    netPrice: 0,
    receiptStatus: "",
    createdReceipt: new Date(),
    receiptItems: [],
  });

  const toppingDialog = ref(false);
  const selectedProduct = ref<Product | null>(null);
  const productStore = useProductStore();

  const addToReceipt = (
    productType: ProductType,
    toppings: Topping[],
    quantity: number,
    price: number
  ) => {
    
    const existingItem = receipt.value.receiptItems.find(
      (item) =>
        item.productTypeToppings[0].productType.productTypeId ===
          productType.productTypeId &&
        item.topping === toppings.map((t) => t.toppingName).join(", ") &&
        item.quantity === quantity &&
        item.price === price
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price += price;
      
    } else {
      receipt.value.receiptItems.push({
        productTypeToppings: [
          { productType, topping: toppings[0], quantity, sweetness: 0 },
        ],
        topping: toppings.map((t) => t.toppingName).join(", "),
        type: productType.productTypeName,
        quantity,
        price,
        product:productStore.selectedProduct
      });
    }
    calculateTotalPrice();
    console.log( JSON.stringify(receipt.value.receiptItems));
  };

  const calculateTotalPrice = () => {
    receipt.value.totalPrice = receipt.value.receiptItems.reduce(
      (acc, item) => acc + item.price,
      0
    );
  };

  const selectProduct = (product: Product) => {
    selectedProduct.value = product;
    toppingDialog.value = true;
  };

  const removeItem = (index: number) => {
    selectedItems.value.splice(index, 1);
    calculateTotalPrice();
  };

  const applyPromotion = (promotion: ReceiptPromotion) => {
    receiptPromotions.value.push(promotion);
    calculateTotalPrice();
  };

  return {
    selectedItems,
    receiptPromotions,
    customerPhone,
    customerPoints,
    addToReceipt,
    removeItem,
    totalPrice,
    netPrice,
    applyPromotion,
    selectProduct,
    toppingDialog,
    totalDiscount,
    selectedProduct,
    receipt,
    calculateTotalPrice

  };
});
