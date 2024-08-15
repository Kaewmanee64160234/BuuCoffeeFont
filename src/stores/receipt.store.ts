import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Receipt } from "@/types/receipt.type";
import receiptService from "@/service/receipt.service";
import { useUserStore } from "./user.store";

export const useReceiptStore = defineStore("receipt", () => {
  const receipts = ref<Receipt[]>([]);
  const receipt = ref<Receipt | null>(null);
  const searchQuery = ref<string>("");
  const receiptOld = ref(false);
  const historyReceiptDialog = ref(false);
  const historyReceiptDialogCatering = ref(false);
  const userStore = useUserStore();
  const isLoading = ref(false); // loading state
  const errorMessage = ref<string | null>(null); // error message state

  const getAllReceipts = async () => {
    try {
      isLoading.value = true;
      const response = await receiptService.getAllReceipts();
      if (response.status === 200) {
        receipts.value = response.data;
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = "ไม่สามารถโหลดข้อมูลใบเสร็จได้";
    } finally {
      isLoading.value = false;
    }
  };

  const getReceiptById = async (id: number) => {
    try {
      isLoading.value = true;
      const response = await receiptService.getReceiptById(id);
      if (response.status === 200) {
        receipt.value = response.data;
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = `ไม่สามารถโหลดข้อมูลใบเสร็จ ID: ${id} ได้`;
    } finally {
      isLoading.value = false;
    }
  };

  const createReceipt = async (newReceipt: Receipt) => {
    try {
      isLoading.value = true;
      const response = await receiptService.createReceipt(newReceipt);
      if (response.status === 201) {
        receipts.value.push(response.data);
        await getAllReceipts();
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
      errorMessage.value = "เกิดข้อผิดพลาดในการสร้างใบเสร็จ";
    } finally {
      isLoading.value = false;
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

  const getRecieptIn30Min = async () => {
    try {
      isLoading.value = true;
      let typeOfStore = "";
      if (userStore.currentUser.userRole == "พนักงานขายข้าว") {
        typeOfStore = "ร้านข้าว";
      } else {
        typeOfStore = "ร้านกาแฟ";
      }

      const response = await receiptService.getRecieptIn30Min(typeOfStore);
      if (response.status === 200) {
        receipts.value = response.data;
        console.log("receipts", receipts.value);
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = "ไม่สามารถโหลดข้อมูลใบเสร็จใน 30 นาทีได้";
    } finally {
      isLoading.value = false;
    }
  };

  const getRecieptCateringIn24Hours = async () => {
    try {
      isLoading.value = true;
      const response = await receiptService.getRecieptCateringIn24Hours();
      if (response.status === 200) {
        receipts.value = response.data;
        console.log("receipts", receipts.value);
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = "ไม่สามารถโหลดข้อมูลใบเสร็จรับรองใน 24 ชั่วโมงได้";
    } finally {
      isLoading.value = false;
    }
  };

  const cancelReceipt = async (id: number) => {
    try {
      isLoading.value = true;
      const response = await receiptService.cancelReceipt(id);
      if (response.status === 200) {
        await getRecieptIn30Min();
      }
      return response;
    } catch (error) {
      console.error(error);
      errorMessage.value = `ไม่สามารถยกเลิกใบเสร็จ ID: ${id} ได้`;
    } finally {
      isLoading.value = false;
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
    getRecieptIn30Min,
    cancelReceipt,
    receiptOld,
    getRecieptCateringIn24Hours,
    historyReceiptDialogCatering,
    isLoading, // expose loading state
    errorMessage, // expose error message state
  };
});
