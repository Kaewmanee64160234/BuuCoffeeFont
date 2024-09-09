import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Receipt } from "@/types/receipt.type";
import receiptService from "@/service/receipt.service";
import { useUserStore } from "./user.store";
import { usePosStore } from "./pos.store";
import Swal from "sweetalert2";

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
  const currentReceipt = ref({});
  const posStore = usePosStore();

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
  const deleteReceiptFromLocalStorage = (receiptId: number) => {
    // get from localstoage then file

    const storedQueueList = localStorage.getItem("queueReceipt");
    console.log(storedQueueList);

    if (storedQueueList) {
      posStore.queueReceipt = JSON.parse(storedQueueList);
    } else {
      posStore.queueReceipt = []; // Initialize if not found
      posStore.saveQueueListToLocalStorage(); // Save initial empty list
    }
    const receiptIndex = posStore.queueReceipt.findIndex(
      (receipt) => receipt.receiptId === receiptId
    );
    if (receiptIndex !== -1) {
      posStore.queueReceipt.splice(receiptIndex, 1);
      posStore.saveQueueListToLocalStorage();
    }
  };
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
        console.log("receipts getRecieptIn30Min", receipts.value);
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
        deleteReceiptFromLocalStorage(id);
       
          Swal.fire('ยกเลิกคำสั่งซื้อสำเร็จ', '', 'success');
          posStore.ReceiptDialogPos = false;
        
        
      }

      // return response;
    } catch (error) {
      console.error(error);
      errorMessage.value = `ไม่สามารถยกเลิกใบเสร็จ ID: ${id} ได้`;
    } finally {
      isLoading.value = false;
    }
  };
  const setReceiptForEdit = (receiptToEdit: Receipt) => {
    receipt.value = receiptToEdit;
  };

  const getCurrentReceipt = async () => {
    try {
      const receipt = localStorage.getItem('receipt');
      if (receipt) {
        currentReceipt.value = JSON.parse(receipt); // Use = for assignment
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };
  

  return {
    setReceiptForEdit,
    getCurrentReceipt,

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
    deleteReceiptFromLocalStorage
  };
});
