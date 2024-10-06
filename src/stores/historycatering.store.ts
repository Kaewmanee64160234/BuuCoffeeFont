import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { HistoryCateringEvent } from "@/types/catering/history_catering.type";
import axios from "axios";
import Swal from "sweetalert2";
import ingredientService from "@/service/ingredient.service";

export const useCateringEventStore = defineStore("cateringEvent", () => {
  const historyCateringEvent = ref<HistoryCateringEvent[]>([]);
  const historyCateringitem = ref<HistoryCateringEvent | null>(null);
  const dialogCateringItem = ref(false);
  const fetchCateringEvents = async () => {
    try {
      const response = await axios.get<HistoryCateringEvent[]>(
        "http://localhost:3000/catering-event"
      );
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
        await axios.patch(`http://localhost:3000/catering-event/${id}/status`, {
          status,
        });
        await fetchCateringEvents();
        Swal.fire(
          "เปลี่ยนสถานะ!",
          "สถานะของเหตุการณ์ถูกเปลี่ยนแล้ว.",
          "success"
        );
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
        await axios.patch(
          `http://localhost:3000/checkingredients/${id}/cancel`
        );
        await fetchCateringEvents();
        Swal.fire("ยกเลิกแล้ว!", "เหตุการณ์นี้ถูกยกเลิก.", "success");
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
  return {
    historyCateringEvent,
    dialogCateringItem,
    historyCateringitem,
    fetchCateringEvents,
    updateStatus,
    cancelEvent,
    getHistoryCateringById,
    
  };
});
