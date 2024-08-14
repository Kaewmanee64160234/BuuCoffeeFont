import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Receipt } from "@/types/receipt.type";
import receiptService from "@/service/receipt.service";
import { useUserStore } from "./user.store";

export const useReceiptStore = defineStore("receipt", () => {
  const receipts = ref<Receipt[]>([]);
  const receipt = ref<Receipt | null>(null);
  const searchQuery = ref<string>("");
  const historyReceiptDialog = ref(false);
  const userStore = useUserStore();

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
      let typeOfStore = "";
      if(userStore.currentUser.userRole == "พนักงานขายข้าว"){
        typeOfStore = "ร้านข้าว"
      }else{
        typeOfStore = "ร้านกาแฟ"
      }

      const response = await receiptService.getRecieptIn30Min(
        typeOfStore
      );
      if (response.status === 200) {
        receipts.value = response.data;
        console.log("receipts", receipts.value);
      }
    } catch (error) {
      console.error(error);
    }


  };

  // get recipt Catering in 24 hours
  const getRecieptCateringIn24Hours = async () => {
    try {
      const response = await receiptService.getRecieptCateringIn24Hours();
      if (response.status === 200) {
        receipts.value = response.data;
        console.log("receipts", receipts.value);
      }
    } catch (error) {
      console.error(error);
    }
  };
// cancelReceipt
  const cancelReceipt = async (id: number) => {
    try {
      const response = await receiptService.cancelReceipt(id);
      if (response.status === 200) {
        await getRecieptIn30Min();
      }
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  
  return {
    receipts,
    receipt,
    getAllReceipts,
    getReceiptById,
    createReceipt,
    searchQuery,
    historyReceiptDialog,
    filteredReceipts,
    getRecieptIn30Min,
    cancelReceipt,
    getRecieptCateringIn24Hours
  };
});
