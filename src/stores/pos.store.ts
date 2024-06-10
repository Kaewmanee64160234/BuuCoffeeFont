// stores/posStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Product } from "@/types/product.type";
import type { ProductTypeTopping } from "@/types/productTypeTopping.type";
import type { ReceiptPromotion } from "@/types/receiptPromotion.type";
import type { ReceiptItem } from "@/types/recipt.type";

export const usePosStore = defineStore("pos", () => {
  const selectedItems = ref<ReceiptItem[]>([]);
  const receiptPromotions = ref<ReceiptPromotion[]>([]);
  const customerPhone = ref<string>("");
  const customerPoints = ref<number>(0);
  const totalDiscount = ref<number>(0);
  const totalPrice = ref<number>(0);
  const netPrice = ref<number>(0);

  const addToCart = (product: Product, productTypeTopping: ProductTypeTopping) => {
    const index = selectedItems.value.findIndex((item) => item.product.productId === product.productId);
    const quantity = productTypeTopping.quantity;

    if (index === -1) {
      selectedItems.value.push({
        product: product,
        productTypeToppings: [productTypeTopping],
        quantity: quantity,
        receiptSubTotal: calculateSubTotal(product, [productTypeTopping], quantity),
      });
    } else {
      const item = selectedItems.value[index];
      console.log('productTypeToppings', item.productTypeToppings);

      const toppingIndex = item.productTypeToppings.findIndex(t => 
        t.topping && t.topping.toppingId === productTypeTopping.topping.toppingId && 
        t.productType && t.productType.productTypeId === productTypeTopping.productType.productTypeId
      );

      if (toppingIndex === -1) {
        item.productTypeToppings.push(productTypeTopping);
      } else {
        item.productTypeToppings[toppingIndex].quantity += productTypeTopping.quantity;
      }
      
      item.quantity += quantity;
      item.receiptSubTotal = calculateSubTotal(item.product, item.productTypeToppings, item.quantity);
    }

    calculateTotalPrice();
  };

  const calculateSubTotal = (product: Product, productTypeToppings: ProductTypeTopping[], quantity: number) => {
    let subTotalTopping = 0;
    if (Array.isArray(productTypeToppings)) {
      for (let j = 0; j < productTypeToppings.length; j++) {
        if (productTypeToppings[j] && productTypeToppings[j].topping) {
          subTotalTopping += parseFloat(productTypeToppings[j].topping.toppingPrice + '') * productTypeToppings[j].quantity;
        }
      }
    }

    const productTypePrice = productTypeToppings.length > 0 ? parseFloat(productTypeToppings[0].productType.productTypePrice + '') : 0;
    const productPrice = parseFloat(product.productPrice + '');
    const productSubTotal = (parseFloat(productPrice+'') + parseFloat(productTypePrice+'') + parseFloat(subTotalTopping+'')) * quantity;

    console.log(`Product Price: ${productPrice}, Product Type Price: ${productTypePrice}, Topping SubTotal: ${subTotalTopping}, Quantity: ${quantity}, SubTotal: ${productSubTotal}`);

    return productSubTotal;
  };

  const calculateTotalPrice = () => {
    let total = 0;
    let totalDiscountValue = 0;

    for (let i = 0; i < selectedItems.value.length; i++) {
      const item = selectedItems.value[i];
      total += item.receiptSubTotal;
    }

    // Assuming totalDiscount is a fixed value or percentage
    if (typeof totalDiscount.value === "number") {
      totalDiscountValue = totalDiscount.value;
    } else {
      // If the discount is a percentage (e.g., '10%' -> 0.10)
      const discountPercentage = parseFloat(totalDiscount.value) / 100;
      totalDiscountValue = total * discountPercentage;
    }

    netPrice.value = total - totalDiscountValue;
    totalPrice.value = total;

    console.log("Total Price:", totalPrice.value);
    console.log("Total Discount:", totalDiscountValue);
    console.log("Net Price:", netPrice.value);
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
    addToCart,
    removeItem,
    totalPrice,
    netPrice,
    applyPromotion,
  };
});
