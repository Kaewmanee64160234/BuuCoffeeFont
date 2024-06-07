// create toppingStore

import toppingService from "@/service/topping.service";
import type { Topping } from "@/types/topping.type";
import { defineStore } from "pinia";
import { ref } from "vue";


export const useToppingStore = defineStore("topping", () => {

    const toppings = ref<Topping[]>([]);
    const topping = ref<Topping>();
    const updateToppingDialog = ref(false);
    const createToppingDialog = ref(false);
    const searchQuery = ref<string>("");

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
        getToppingById
    }



});