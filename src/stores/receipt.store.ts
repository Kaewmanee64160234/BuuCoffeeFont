import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import { mapToReceipt, type Receipt } from "@/types/receipt.type";
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

  const currentPage = ref(1);
  const itemsPerPage = ref(5); 
  const totalReceipts = ref(0); 

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
      const response = await receiptService.createReceipt(newReceipt);
      if (response.status === 201) {
        receipts.value.push(response.data); // เพิ่มผู้ใช้ใหม่เข้าในลิสต์โดยตรง
        totalReceipts.value += 1; // อัปเดตจำนวนผู้ใช้ทั้งหมด
  
        // ตรวจสอบว่ามีผู้ใช้เกินจำนวนที่แสดงต่อหน้าได้หรือไม่
        const totalPages = Math.ceil(totalReceipts.value / itemsPerPage.value);
        if (currentPage.value < totalPages) {
          currentPage.value = totalPages; // เปลี่ยนไปยังหน้าสุดท้าย
        }
        
        // โหลดข้อมูลผู้ใช้ใหม่
        await getReceiptPaginate();
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
  const getRecieptIn30Min = async (typeOfStore:string) => {
    try {
      console.log(typeOfStore)
      isLoading.value = true;
     
      const response = await receiptService.getRecieptIn30Min(typeOfStore);
      if (response.status === 200) {

        receipts.value = response.data;
        console.log("receipts getRecieptIn30Min", receipts.value);
      }
      await getReceiptPaginate();
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
      await getReceiptPaginate();
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
      await getReceiptPaginate();
    } catch (error) {
      console.error('Error getting current receipt:', error);
    }
  };

  const getReceiptPaginate = async () => {
    // console.log(currentPage.value)
    // console.log(itemsPerPage.value)
    try {
      // Call the promotion service to fetch paginated data
      const response = await receiptService.getReceiptPaginate(
        // 15,
        // 0,
        // ''
        currentPage.value,   // Current page
        itemsPerPage.value,  // Items per page
        searchQuery.value    // Search term
      );
  
      // Log the response for debugging
      console.log('getReceiptPaginate', response.data);
  
      if (response.status === 200) {
        // Update receipts and total receipts in the store
        receipts.value = response.data.data;   // Assign fetched receipt data
        totalReceipts.value = response.data.total;  // Total number of receipts
      }
    } catch (error) {
      // Handle errors and log them
      console.error('Error getting receipts:', error);
    }
  };


   watch([currentPage, itemsPerPage, searchQuery], async () => {
    await getReceiptPaginate();
  });

  return {
    setReceiptForEdit,
    getCurrentReceipt,
    getReceiptPaginate,
    currentPage,
    itemsPerPage,
    totalReceipts,

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
