import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Receipt } from "@/types/receipt.type";
import receiptService from "@/service/receipt.service";

export const useReceiptStore = defineStore("receipt", () => {
  const receipts = ref<Receipt[]>([]);
  const receipt = ref<Receipt | null>(null);
  const searchQuery = ref<string>("");
  const historyReceiptDialog = ref(false);

  const getAllReceipts = async () => {
    try {
      const response = await receiptService.getAllReceipts();
      if (response.status === 200) {
        receipts.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getReceiptById = async (id: number) => {
    try {
      const response = await receiptService.getReceiptById(id);
      if (response.status === 200) {
        receipt.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createReceipt = async (newReceipt: Receipt) => {
    try {
      const response = await receiptService.createReceipt(newReceipt);
      if (response.status === 201) {
        receipts.value.push(response.data);
        await getAllReceipts();
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
    }
  };

  const filteredReceipts = computed(() => {
    if (!searchQuery.value) {
      return receipts.value;
    }
    return receipts.value.filter(receipt =>
      receipt.customer?.customerName?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  // getRecieptIn30Min
  const getRecieptIn30Min = async () => {
    try {
      const response = await receiptService.getRecieptIn30Min();
      if (response.status === 200) {
        receipts.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    receipts,
    receipt,
    getAllReceipts,
    getReceiptById,
    createReceipt,
    searchQuery,
    historyReceiptDialog,
    filteredReceipts,
    getRecieptIn30Min
  };
});
