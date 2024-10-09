// create toppingStore

import toppingService from "@/service/topping.service";
import type { Topping } from "@/types/topping.type";
import { defineStore } from "pinia";
import { ref, watch } from "vue";


export const useToppingStore = defineStore("topping", () => {

    const toppings = ref<Topping[]>([]);
    const topping = ref<Topping>();
    const updateToppingDialog = ref(false);
    const createToppingDialog = ref(false);
    const searchQuery = ref<string>("");
    const totalToppings = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(5);

    // watch for pagination
    watch([currentPage, itemsPerPage, searchQuery], () => {
        getToppingsPaginate();
      });
    


    const createTopping = async (topping: Topping) => {
        try {
            const res = await toppingService.createTopping(topping);
            if (res.data) {
                toppings.value.push(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const updateTopping = async (id: number, topping: Topping) => {
        try {
            const res = await toppingService.updateTopping(id, topping);
            if (res.data) {
                const index = toppings.value.findIndex((topping) => topping.toppingId === id);
                toppings.value[index] = res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    const deleteTopping = async (id: number) => {
        try {
            const res = await toppingService.deleteTopping(id);
            if (res.status === 200) {
                const index = toppings.value.findIndex((topping) => topping.toppingId === id);
                toppings.value.splice(index, 1);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getAllToppings = async () => {
        try {
            const res = await toppingService.getAllToppings();
            if (res.data) {
                toppings.value = res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getToppingById = async (id
        : number) => {
        try {
            const res = await toppingService.getToppingById(id);
            if (res.data) {
                topping.value = res.data;
            }
        } catch (error) {
            console.error(error);
        }
    }

    // getToppingsPaginate
    const getToppingsPaginate = async () => {
        try {
          const response = await toppingService.getToppingPaginate(currentPage.value, itemsPerPage.value, searchQuery.value);
          console.log('getToppingPaginate', response.data);
          if (response.status === 200) {
            toppings.value = response.data.data;
            totalToppings.value = response.data.total;
          }
        } catch (error) {
          console.error('Error getting toppings:', error);
        }
    };


    return {
        toppings,
        topping,
        updateToppingDialog,
        createToppingDialog,
        searchQuery,
        createTopping,
        updateTopping,
        deleteTopping,
        getAllToppings,
        getToppingById,
        getToppingsPaginate,
        totalToppings,
        currentPage,
        itemsPerPage,
        

    }



});