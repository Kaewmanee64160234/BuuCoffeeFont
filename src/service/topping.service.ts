// create function for topping
import type { Topping } from "@/types/topping.type";
import http from "./axios";

function getAllToppings() {
  return http.get("/toppings");
}

function getToppingById(id: number)
{
  return http.get(`/toppings/${id}`);
}

function createTopping(topping: Topping)
{
  const topping_ = {
    toppingName: topping.toppingName,
    toppingPrice: topping.toppingPrice
  };

  return http.post("/toppings", topping_);
}

function updateTopping(id: number, topping: Topping)
{
  return http.patch(`/toppings/${id}`, topping);
}

function deleteTopping(id: number)
{
  return http.delete(`/toppings/${id}`);
}


//  getProductPaginate by add query page and size
function getToppingPaginate(page: number, size: number,search : string) {
  return http.get(`/toppings/paginate`, {
    params: {
      page,
      limit: size,
      search
    }
  });

}

export default {
  getAllToppings,
  getToppingById,
  createTopping,
  updateTopping,
  deleteTopping,
  getToppingPaginate
};
