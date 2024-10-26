
import type { CateringEvent } from "@/types/catering/catering_event.type";
import http from "./axios";

function createCateringEvent(cateringEvent: CateringEvent) {
    return http.post("/catering-events", cateringEvent);
}

// // update status catering event
function updateStatusCateringEvent(id: string, status: string) {
    return http.patch(`/catering-events/${id}/status`, {
      status
    });
  }
//   // cancel catering event
function cancelCateringEvent(id: string) {
    return http.patch(`/catering-events/${id}/cancel`);
  }

  

export
default {
    createCateringEvent,
    updateStatusCateringEvent,
    cancelCateringEvent
};