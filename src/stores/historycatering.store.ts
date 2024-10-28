import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { HistoryCateringEvent } from "@/types/catering/history_catering.type";
import axios from "axios";
import Swal from "sweetalert2";
import ingredientService from "@/service/ingredient.service";
import financeService from "@/service/report/finance.service";
import categoryService from "@/service/category.service";
import cateringService from "@/service/catering.service";
export const useCateringEventStore = defineStore("cateringEvent", () => {
  const historyCateringEvent = ref<HistoryCateringEvent[]>([]);
  const historyCateringitem = ref<HistoryCateringEvent | null>(null);
  const dialogCateringItem = ref(false);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const last_page = ref(1);
  const meta = ref({
    total: 0,
    page: 1,
    last_page: 1,
  });

  const fetchCateringEvents = async () => {
    try {
      const response = await financeService.cateringEvent();
      historyCateringEvent.value = response.data;
      console.log(historyCateringEvent.value);
    } catch (error) {
      console.error("Error fetching catering events:", error);
      throw error;
    }
  };
  const updateStatus = async (id: string, status: string) => {
    const result = await Swal.fire({
      title: "ยืนยันการเปลี่ยนสถานะ?",
      text: `คุณต้องการเปลี่ยนสถานะเป็น ${status}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, เปลี่ยนสถานะ!",
    });

    if (result.isConfirmed) {
      try {
        const res = await cateringService.updateStatusCateringEvent(id, status);
        if (res.status === 200) {
          await cateringEventPaginate(currentPage.value, itemsPerPage.value);
          Swal.fire(
            "เปลี่ยนสถานะ!",
            "สถานะของเหตุการณ์ถูกเปลี่ยนแล้ว.",
            "success"
          );
        }
      } catch (error) {
        console.error("Failed to update event status:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถเปลี่ยนสถานะได้.", "error");
      }
    }
  };

  const cancelEvent = async (id: string) => {
    const result = await Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "คุณต้องการยกเลิกเหตุการณ์นี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ยกเลิก!",
    });

    if (result.isConfirmed) {
      try {
        const res = await cateringService.cancelCateringEvent(id);
        if (res.status === 200) {
          await fetchCateringEvents();
          Swal.fire("ยกเลิกแล้ว!", "เหตุการณ์นี้ถูกยกเลิก.", "success");
        }
          await cateringEventPaginate(currentPage.value, itemsPerPage.value);

      } catch (error) {
        console.error("Failed to cancel event:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถยกเลิกเหตุการณ์ได้.", "error");
      }
    }
  };

  
  const getHistoryCateringById = async (id: number) => {
    try {
      const response = await ingredientService.getHistoryCateringById(id);
      if (response.status === 200) {
        historyCateringitem.value = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const cateringEventPaginate = async (page: number, limit: number) => {
    try {
      const response = await financeService.cateringEventPaginate(page, limit);
      historyCateringEvent.value = response.data.data;
      totalItems.value = response.data.meta.total; // Make sure meta contains the total count
      currentPage.value = response.data.meta.page;
      itemsPerPage.value = response.data.meta.limit;
      last_page.value = response.data.meta.last_page;

      console.log(response.data);
      
    } catch (error) {
      console.error("Failed to fetch catering events:", error);
    }
  };

  return {
    historyCateringEvent,
    historyCateringitem,
    dialogCateringItem,
    meta,
    fetchCateringEvents,
    updateStatus,
    cancelEvent,
    getHistoryCateringById,
    cateringEventPaginate,
    totalItems,
    itemsPerPage,
    currentPage,
    last_page
  };
});
