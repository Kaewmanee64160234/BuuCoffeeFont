import type { CateringEvent } from "@/types/catering/catering_event.type";
import http from "./axios";

function createCateringEvent(cateringEvent: CateringEvent) {
  console.log("cateringEvent", JSON.stringify({...cateringEvent, 
    mealDto:{...cateringEvent.meals}}));
  return http.post("/catering-events" , {
    ...cateringEvent,
    mealDto:cateringEvent.meals
  });
  
}

// // update status catering event
function updateStatusCateringEvent(id: string, status: string) {
  return http.patch(`/catering-events/${id}/status`, {
    status,
  });
}
//   // cancel catering event
function cancelCateringEvent(id: string) {
  return http.patch(`/catering-events/${id}/cancel`);
}
// get subinventortRice by productId
function getSubInventoriesCoffeeByProductId(productId: number) {
  return http.get(`/sub-inventories-coffee/product/${productId}`);
}
//  getsubinventortCoffee by productId
function getSubInventoriesRiceByProductId(productId: number) {
  return http.get(`/sub-inventories-rice/product/${productId}`);
}
// findCateringEventById
function findCateringEventById(id: number) {
  return http.get(`/catering-events/${id}`);
}
// updateCateringEvent
function updateCateringEvent(id: number, cateringEvent: CateringEvent) {
  return http.patch(`/catering-events/${id}`, cateringEvent);
}
export default {
  createCateringEvent,
  updateStatusCateringEvent,
  cancelCateringEvent,
  getSubInventoriesCoffeeByProductId,
  getSubInventoriesRiceByProductId,
  findCateringEventById,
  updateCateringEvent,
};
