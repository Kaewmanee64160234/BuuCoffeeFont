import { defineStore } from "pinia";
import { ref } from "vue";
import type { Product } from "@/types/product.type";
import type { ProductTypeTopping } from "@/types/productTypeTopping.type";
import type { ReceiptPromotion } from "@/types/receiptPromotion.type";
import type { Receipt, ReceiptItem } from "@/types/receipt.type";
import type { ProductType } from "@/types/productType.type";
import type { Topping } from "@/types/topping.type";
import { useProductStore } from "./product.store";
import receiptService from "@/service/receipt.service";

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
  product: Product,
  productType: ProductType,
  productTypeToppings: ProductTypeTopping[],
  quantity: number,
  sweetness: number
) => {
  // console.log("productType topping", productTypeToppings);
  const parsedQuantity = parseInt(quantity.toString(), 10);
  const productPrice =parseInt( product.productPrice+'');

  let existingItem;
  if (product.category.haveTopping) {
    existingItem = selectedItems.value.find(
      (item) =>
        JSON.stringify(item.productTypeToppings) ===
          JSON.stringify(productTypeToppings) &&
        item.product?.productId === product.productId &&
        item.sweetnessLevel === sweetness
    );
  } else {
    existingItem = selectedItems.value.find(
      (item) => item.product?.productId === product.productId
    );
  }

  if (existingItem) {
    if (product.category.haveTopping) {
      if (productTypeToppings.length > 0) {
        const toppingsTotal = productTypeToppings.reduce(
          (toppingAcc, toppingItem) =>
            toppingAcc +
            parseFloat(toppingItem.topping.toppingPrice.toString()) * parsedQuantity,
          0
        );
        const itemTotal = productPrice * parsedQuantity + toppingsTotal;
        existingItem.receiptSubTotal += itemTotal + parseFloat(productType.productTypePrice.toString());
      } else {
        existingItem.receiptSubTotal +=
          productPrice * parsedQuantity + parseFloat(productType.productTypePrice.toString());
      }
    } else {
      existingItem.receiptSubTotal += productPrice * parsedQuantity;
    }
  } else {
    if (product.category.haveTopping) {
      if(productTypeToppings.length > 0) {
        const toppingsTotal = productTypeToppings.reduce(
          (toppingAcc, toppingItem) =>
            toppingAcc +
            (parseFloat(toppingItem.topping.toppingPrice.toString())*parseFloat(toppingItem.quantity+'')) * parsedQuantity,
          0
        );
      const itemTotal = productPrice * parsedQuantity + toppingsTotal;
      selectedItems.value.push({
        productTypeToppings,
        quantity: parsedQuantity,
        receiptSubTotal: itemTotal + parseFloat(productType.productTypePrice.toString()),
        product,
        sweetnessLevel:sweetness,
      });
      }else{
        selectedItems.value.push({
          productTypeToppings: [],
          quantity: parsedQuantity,
          receiptSubTotal: productPrice * parsedQuantity + parseFloat(productType.productTypePrice.toString()),
          product,
          sweetnessLevel:sweetness,
        });
      }
     
    
    } else {
      selectedItems.value.push({
        productTypeToppings: [],
        quantity: parsedQuantity,
        receiptSubTotal: productPrice * parsedQuantity,
        product,
        sweetnessLevel:sweetness,
      });
    }
  }
  console.log('last',selectedItems.value[selectedItems.value.length - 1]);
  productStore.totalProducts = calculateTotal(selectedItems.value);
};

// calculate total
const calculateTotal = (selectedItems: ReceiptItem[]) => {
  return selectedItems.reduce((acc, item) => {
    return acc + parseFloat(item.receiptSubTotal.toString());
  }, 0);
}



  const removeItem = (index: number) => {
    selectedItems.value.splice(index, 1);
    // productStore.totalProducts = calculateSubtotal(selectedItems.value);
  };

  // create function create recipt 
  const createReceipt = async () => {
    receipt.value.receiptItems = selectedItems.value;
    receipt.value.receiptTotalPrice = productStore.totalProducts;
    receipt.value.receiptTotalDiscount = totalDiscount.value;
    receipt.value.receiptNetPrice = netPrice.value;
    receipt.value.receiptType = "coffee";
    receipt.value.receiptStatus = "pending";
    receipt.value.createdReceipt = new Date();
    

    await receiptService.createReceipt(receipt.value);
  };


  const applyPromotion = (promotion: ReceiptPromotion) => {
    receiptPromotions.value.push(promotion);
    // productStore.totalProducts = calculateSubtotal(selectedItems.value);
  };

  const selectProduct = (product: Product) => {
    selectedProduct.value = product;
    toppingDialog.value = true;
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
    // applyPromotion,
    selectProduct,
    toppingDialog,
    totalDiscount,
    selectedProduct,
    receipt,
    createReceipt
  };
});
