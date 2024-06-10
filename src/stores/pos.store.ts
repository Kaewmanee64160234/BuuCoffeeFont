// stores/posStore.ts
import type { Product } from '@/types/product.type';
import type { ReceiptPromotion } from '@/types/receiptPromotion.type';
import type { ReceiptItem } from '@/types/recipt.type';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';


export const usePosStore = defineStore('pos', () => {
  const selectedItems = ref<ReceiptItem[]>([]);
  const receiptPromotions = ref<ReceiptPromotion[]>([]);
  const customerPhone = ref<string>('');
  const customerPoints = ref<number>(0);

  const addToCart = (product: Product, productTypeToppings: any[] = []) => {
    const existingItem = selectedItems.value.find(item => 
      item.product.productId === product.productId &&
      JSON.stringify(item.productTypeToppings) === JSON.stringify(productTypeToppings)
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.receiptSubTotal += product.productPrice;
    } else {
      selectedItems.value.push({
        receiptItemId: Date.now(), // Simplified ID generation
        quantity: 1,
        receiptSubTotal: product.productPrice,
        product,
        productTypeToppings,

      });
    }
  };



  const removeItem = (index: number) => {
    selectedItems.value.splice(index, 1);
  };

  const totalPrice = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.receiptSubTotal, 0);
  });

  const applyPromotion = (promotion: ReceiptPromotion) => {
    receiptPromotions.value.push(promotion);
  };

  return {
    selectedItems,
    receiptPromotions,
    customerPhone,
    customerPoints,
    addToCart,
    removeItem,
    totalPrice,
    applyPromotion,
  };
});
