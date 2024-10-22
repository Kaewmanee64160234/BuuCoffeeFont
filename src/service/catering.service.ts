
import type { CateringEvent } from "@/types/catering/catering_event.type";
import http from "./axios";

function createCateringEvent(cateringEvent: CateringEvent) {
    return http.post("/catering-events", cateringEvent);
}

export
default {
    createCateringEvent
};