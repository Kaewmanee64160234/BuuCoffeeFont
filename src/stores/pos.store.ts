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
import type { Promotion } from "@/types/promotion.type";
import { useCustomerStore } from "./customer.store";
import Swal from 'sweetalert2';

export const usePosStore = defineStore("pos", () => {
  const selectedItems = ref<ReceiptItem[]>([]);
  const receiptPromotions = ref<ReceiptPromotion[]>([]);
  const customerPhone = ref<string>("");
  const customerPoints = ref<number>(0);
  const totalDiscount = ref<number>(0);
  const totalPrice = ref<number>(0);
  const netPrice = ref<number>(0);
  const receipt = ref<Receipt>({
    receiptType: "",
    receiptTotalDiscount: 0,
    receiptNetPrice: 0,
    receiptStatus: "",
    createdReceipt: new Date(),
    receiptItems: [],
    receiptPromotions: [],
    receiptTotalPrice: 0,
    paymentMethod: "",
  });

  const currentReceipt = ref<Receipt>();

  const toppingDialog = ref(false);
  const selectedProduct = ref<Product | null>(null);
  const productStore = useProductStore();
  const receiptDialog = ref(false);
  const customerStore = useCustomerStore();

  const addToReceipt = (
    product: Product,
    productType: ProductType,
    productTypeToppings: ProductTypeTopping[],
    quantity: number,
    sweetness: number
  ) => {
    // console.log("productType topping", productTypeToppings);
    const parsedQuantity = parseInt(quantity.toString(), 10);
    const productPrice = parseInt(product.productPrice + "");

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
          existingItem.quantity += parsedQuantity;
          const toppingsTotal = productTypeToppings.reduce(
            (toppingAcc, toppingItem) =>
              toppingAcc +
              parseFloat(toppingItem.topping.toppingPrice.toString()) *
                parseFloat(toppingItem.quantity + "") *
                existingItem.quantity,
            0
          );
          const itemTotal =
            (productPrice +
              parseFloat(productType.productTypePrice.toString())) *
              existingItem.quantity +
            toppingsTotal;
          existingItem.receiptSubTotal = itemTotal;
        } else {
          existingItem.receiptSubTotal +=
            (productPrice +
              parseFloat(productType.productTypePrice.toString())) *
            parsedQuantity;
          existingItem.quantity += parsedQuantity;
        }
      } else {
        existingItem.receiptSubTotal += productPrice * parsedQuantity;
        existingItem.quantity += parsedQuantity;
      }
    } else {
      if (product.category.haveTopping) {
        if (productTypeToppings.length > 0) {
          const toppingsTotal = productTypeToppings.reduce(
            (toppingAcc, toppingItem) =>
              toppingAcc +
              parseFloat(toppingItem.topping.toppingPrice.toString()) *
                parseFloat(toppingItem.quantity + "") *
                parsedQuantity,
            0
          );
          const itemTotal =
            (productPrice +
              parseFloat(productType.productTypePrice.toString())) *
              parsedQuantity +
            toppingsTotal;
          selectedItems.value.push({
            productTypeToppings,
            quantity: parsedQuantity,
            receiptSubTotal: itemTotal,
            product,
            sweetnessLevel: sweetness,
            productType: productType,
          });
        } else {
          selectedItems.value.push({
            productTypeToppings: [],
            quantity: parsedQuantity,
            receiptSubTotal:
              (productPrice +
                parseFloat(productType.productTypePrice.toString())) *
              parsedQuantity,
            product,
            sweetnessLevel: sweetness,
            productType: productType,
          });
        }
      } else {
        selectedItems.value.push({
          productTypeToppings: [],
          quantity: parsedQuantity,
          receiptSubTotal: productPrice * parsedQuantity,
          product,
          sweetnessLevel: sweetness,
        });
      }
    }
    console.log("last", selectedItems.value[selectedItems.value.length - 1]);
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
  };
  const calculateTotal = (selectedItems: ReceiptItem[]) => {
    receipt.value.receiptTotalPrice = 0;
    return selectedItems.reduce((acc, item) => {
      return acc + parseFloat(item.receiptSubTotal.toString());
    }, 0);
  };

  const removeItem = (index: number) => {
    selectedItems.value.splice(index, 1);
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
    if (selectedItems.value.length === 0) {
      receipt.value.receiptTotalPrice = 0;
      receipt.value.receiptTotalDiscount = 0;
      receipt.value.receiptNetPrice = 0;
      receipt.value.receiptItems = [];
      receipt.value.receiptPromotions = [];
      receipt.value.receiptStatus = "";
      receipt.value.paymentMethod = "";
    }
  };

  const spliceData = (index: number) => {
    selectedItems.value[index].receiptSubTotal -= parseInt(
      selectedItems.value[index].receiptSubTotal /
        selectedItems.value[index].quantity +
        ""
    );
    selectedItems.value[index].quantity -= 1;

    if (selectedItems.value[index].quantity === 0) {
      selectedItems.value.splice(index, 1);
    }
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
    if (selectedItems.value.length === 0) {
      // clear all data
      receipt.value.receiptTotalPrice = 0;
      receipt.value.receiptTotalDiscount = 0;
      receipt.value.receiptNetPrice = 0;
      receipt.value.receiptItems = [];
      receipt.value.receiptPromotions = [];
      receipt.value.receiptStatus = "";
      receipt.value.paymentMethod = "";
    }
  };

  // create function create recipt
  const createReceipt = async () => {
    receipt.value.receiptItems = selectedItems.value;
    receipt.value.receiptType = "coffee";
    receipt.value.receiptStatus = "pending";
    receipt.value.createdDate = new Date();
    if(receipt.value.receiptTotalDiscount===0){
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    }

    const res = await receiptService.createReceipt(receipt.value);
    if (res.status === 201) {
      console.log("Receipt created successfully", res.data);
      currentReceipt.value = res.data;
      await customerStore.getAllCustomers();
    }
  };

  const applyPromotion = (promotion: Promotion) => {
    // Initial validation: check if receipt total price is valid
    if (receipt.value.receiptTotalPrice <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Operation',
        text: 'The total price must be greater than zero to apply a promotion.',
      });
      return;
    }
  
    let newDiscount = 0;
  
    if (promotion.promotionType === 'discountPrice' || promotion.promotionType === 'usePoints') {
      newDiscount = promotion.discountValue!;
    } else if (promotion.promotionType === 'discountPercentage') {
      if (promotion.conditionValue1! <= receipt.value.receiptTotalPrice) {
        newDiscount = receipt.value.receiptTotalPrice * (promotion.discountValue! / 100);
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Invalid Discount Not in Condition',
          text: 'The total price must be greater than or equal to the condition value to apply a percentage discount.',
        });
        return;
      }
    } else {
      const product = selectedItems.value.find((item) => item.product?.productId === promotion.buyProductId);
      const product2 = selectedItems.value.find((item) => item.product?.productId === promotion.freeProductId);
      if (product2 && product) {
        if (promotion.freeProductId === promotion.buyProductId) {
          if (product.quantity >= 2) {
            newDiscount = product.product?.productPrice!;
          }
        } else {
          newDiscount = productStore.products.find((prod) => prod.productId === promotion.freeProductId)?.productPrice!;
        }
      }
    }
  
    // Check if the new discount would result in a negative or zero net price
    const newTotalDiscount = receipt.value.receiptTotalDiscount + newDiscount;
    const newNetPrice = receipt.value.receiptTotalPrice - newTotalDiscount;
  
    if (newNetPrice <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Discount',
        text: 'The discount is too high and would result in a zero or negative total price.',
      });
      return;
    }
  
    // Apply the promotion
    receipt.value.receiptPromotions.push({
      date: new Date(),
      discount: newDiscount,
      promotion: promotion,
    });
  
    // Update receipt totals
    receipt.value.receiptTotalDiscount = newTotalDiscount;
    receipt.value.receiptNetPrice = newNetPrice;
  };
  

  // removePromotion
  const removePromotion = (promotion:Promotion) => {
    const index = receipt.value.receiptPromotions.findIndex(
      (item) => item.promotion.promotionId === promotion.promotionId
    );
    if (index !== -1) {
      receipt.value.receiptPromotions.splice(index, 1);
    }
    // calculate total discount
    receipt.value.receiptTotalDiscount = receipt.value.receiptPromotions.reduce(
      (acc, item) => {
        return acc + parseInt(item.discount! + "");
      },
      0
    );
    receipt.value.receiptNetPrice =
      parseInt(receipt.value.receiptTotalPrice + "") -
      parseFloat(receipt.value.receiptTotalDiscount + "");
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
    toppingDialog,
    totalDiscount,
    selectedProduct,
    receipt,
    createReceipt,
    spliceData,
    applyPromotion,
    currentReceipt,
    receiptDialog,
    removePromotion
  };
});
