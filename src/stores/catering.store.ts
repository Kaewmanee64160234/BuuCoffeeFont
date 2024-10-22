import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Meal, MealProduct } from "@/types/catering/meal.type";
import axios from "axios";
import Swal from "sweetalert2";

export const useCateringStore = defineStore("catering", () => {
  const meals = ref<Meal[]>([]);
  const mealProducts = ref<MealProduct[]>([]);
  const eventData = ref({
    eventName: "",
    eventDate: "",
    eventLocation: "",
    attendeeCount: 0,
    totalBudget: 0,
  });

  async function fetchMeals() {
    try {
      const response = await axios.get("/meals");
      meals.value = response.data;
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  }
  async function saveCheckData(userId: number, eventData: any) {
    const totalBudget = meals.value.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    eventData.totalBudget = totalBudget; // อัปเดต eventData ด้วย totalBudget

    const data = {
      userId,
      eventName: eventData.eventName,
      eventDate: eventData.eventDate,
      eventLocation: eventData.eventLocation,
      attendeeCount: eventData.attendeeCount,
      totalBudget,
      mealDto: meals.value.map((meal) => ({
        mealName: meal.mealName,
        totalPrice: meal.totalPrice,
        mealTime: meal.mealTime,
        mealProductsDto: meal.mealProducts.map((ingredient) => ({
          ingredientId: ingredient.product.productId,
          quantity: ingredient.quantity,
          totalPrice: ingredient.totalPrice,
          type: ingredient.type,
          createdDate: new Date().toISOString(),
        })),
      })),
    };

    try {
      const confirmation = await Swal.fire({
        title: "ยืนยันการบันทึก?",
        text: "คุณต้องการบันทึกข้อมูลนี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "ใช่, บันทึกเลย!",
        cancelButtonText: "ยกเลิก",
      });

      if (confirmation.isConfirmed) {
        const response = await axios.post(
          "http://localhost:3000/checkingredients/create-catering",
          data
        );
        console.log("Data saved successfully:", response.data);

        await Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: "ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว.",
        });

        clearForm();
        return response.data;
      } else {
        console.log("User canceled the data save.");
      }
    } catch (error) {
      console.error("Error saving data:", error);

      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถบันทึกข้อมูลได้, กรุณาลองอีกครั้ง.",
      });
    }
  }

  function clearForm() {
    eventData.value = {
      eventName: "",
      eventDate: "",
      eventLocation: "",
      attendeeCount: 0,
      totalBudget: 0,
    };
    meals.value = [];
  }

  async function saveMeals() {
    try {
      const response = await axios.post("/meals", meals.value);
      return response.data;
    } catch (error) {
      console.error("Error saving meals:", error);
    }
  }

  function addMeal() {
    meals.value.push({
      mealName: "",
      totalPrice: 0,
      mealTime: "",
      cateringEventId: 0,
      mealProducts: [],
    });
  }
  function removeIngredientFromMeal(
    mealIndex: number,
    ingredientIndex: number
  ) {
    meals.value[mealIndex].mealProducts.splice(ingredientIndex, 1);
  }

  function removeMeal(index: number) {
    meals.value.splice(index, 1);
  }

  function addIngredientToMeal(mealIndex: number) {
    meals.value[mealIndex].mealProducts.push({
      mealId: mealIndex,
      product: {
        productId: 0,
        productName: "",
        barcode: "",
        countingPoint: false,
        storeType: "",
        category: {
          categoryId: 0,
          categoryName: "",
        },
        haveTopping: false,
        productImage: "",
        productPrice: 0,
      },
      quantity: 0,
      totalPrice: 0,
      type: "",
    });
  }

  return {
    meals,
    fetchMeals,
    saveMeals,
    addMeal,
    removeMeal,
    addIngredientToMeal,
    removeIngredientFromMeal,
    saveCheckData,
    eventData,
    mealProducts,
  };
});
