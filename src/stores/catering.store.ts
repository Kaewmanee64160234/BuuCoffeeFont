import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { Meal, MealProduct } from "@/types/catering/meal.type";
import axios from "axios";
import Swal from "sweetalert2";
import type { CateringEvent } from "@/types/catering/catering_event.type";
import { useUserStore } from "./user.store";
import type { Receipt, ReceiptItem } from "@/types/receipt.type";
import type { Product, ProductType } from "@/types/product.type";
import { usePosStore } from "./pos.store";
import type { ProductTypeTopping } from "@/types/productTypeTopping.type";

export const useCateringStore = defineStore("catering", () => {
  const meals = ref<Meal[]>([]);
  const userStore = useUserStore();
  const selectedMealIndex = ref<number>(0);
  const cashierAmount = ref<number>(0);

  // Ref for coffee receipt structure
  const coffeeReceipt = ref<Receipt>({
    receiptType: "coffee",
    receiptTotalDiscount: 0,
    receiptNetPrice: 0,
    receiptStatus: "",
    receiptItems: [], // Receipt items for coffee
    receiptPromotions: [],
    receiptTotalPrice: 0,
    paymentMethod: "",
    change: 0,
    receive: 0,
    customer: {
      customerId: 0,
      customerName: "",
      customerPhone: "",
      customerNumberOfStamp: 0,
      createMemberDate: new Date(),
    },
    queueNumber: 0,
    checkIngredientId: 0
  });

  // Ref for rice receipt structure
  const riceReceipt = ref<Receipt>({
    receiptType: "rice",
    receiptTotalDiscount: 0,
    receiptNetPrice: 0,
    receiptStatus: "",
    receiptItems: [], // Receipt items for rice
    receiptPromotions: [],
    receiptTotalPrice: 0,
    paymentMethod: "",
    change: 0,
    receive: 0,
    customer: {
      customerId: 0,
      customerName: "",
      customerPhone: "",
      customerNumberOfStamp: 0,
      createMemberDate: new Date(),
    },
    queueNumber: 0,
    checkIngredientId: 0
  });

  const selectItemEdit = ref<ReceiptItem>({
    receiptItemId: 0,
    productTypeToppings: [],
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
    receiptSubTotal: 0,
  });

  const posStore = usePosStore();

  const cateringEvent = ref<CateringEvent>({
    cashierId: 0,
    meals: [], // Meals with one receipt per meal
    cashierAmount: 0,
    createdDate: new Date(),
    deletedAt: "",
    user: {
      role: {
        id: 0,
        name: "",
        permissions: [],
      },
      userId: 0,
      userEmail: "",
      userName: "",
      userPassword: "",
      userRole: "",
      userStatus: "",
    },
  });

  // Fetch meals
  async function fetchMeals() {
    try {
      const response = await axios.get("/meals");
      cateringEvent.value.meals! = response.data;
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  }

  // Clear form
  function clearForm() {
    cateringEvent.value = {
      cashierId: 0,
      cashierAmount: 0,
      createdDate: new Date(),
      deletedAt: "",
      meals: [],
      user: {
        role: {
          id: 0,
          name: "",
          permissions: [],
        },
        userId: 0,
        userEmail: "",
        userName: "",
        userPassword: "",
        userRole: "",
        userStatus: "",
      },
    };
  }

  // Save meals
  async function saveMeals() {
    try {
      const response = await axios.post("/meals", cateringEvent.value.meals!);
      return response.data;
    } catch (error) {
      console.error("Error saving meals:", error);
    }
  }

// Add meal to the catering event with initialized receipt
const addMeal = () => {
  cateringEvent.value.meals!.push({
    mealName: "",
    mealTime: "",
    totalPrice: 0,
    mealProducts: [],
    receipt: { // Initialize the receipt object here
      receiptType: "", 
      receiptTotalDiscount: 0,
      receiptNetPrice: 0,
      receiptStatus: "",
      createdReceipt: new Date(),
      receiptItems: [], // Initialize empty receipt items
      receiptPromotions: [],
      receiptTotalPrice: 0,
      paymentMethod: "",
      change: 0,
      receive: 0,
      customer: {
        customerId: 0,
        customerName: "",
        customerPhone: "",
        customerNumberOfStamp: 0,
        createMemberDate: new Date(),
      },
    },
  });
  console.log("Added meal:", cateringEvent.value.meals);
  
};


  // Remove an ingredient from a meal
  function removeIngredientFromMeal(
    mealIndex: number,
    ingredientIndex: number
  ) {
    cateringEvent.value.meals![mealIndex].mealProducts.splice(
      ingredientIndex,
      1
    );
  }

  // Remove meal
  function removeMeal(index: number) {
    cateringEvent.value.meals!.splice(index, 1);
  }

  // Create catering event
  const createCateringEvent = async () => {
    try {
      cateringEvent.value.user = userStore.currentUser;
      const response = await axios.post(
        "/catering-events",
        cateringEvent.value
      );
      cateringEvent.value = response.data;
      Swal.fire("Success", "Catering event created successfully", "success");
    } catch (error) {
      console.error("Error creating catering event:", error);
      Swal.fire("Error", "Error creating catering event", "error");
    }
  };

  const calculateTotal = (receiptItems: ReceiptItem[]) => {
    return receiptItems.reduce((total, item) => {
      let itemTotal = item.receiptSubTotal;
      if (item.productTypeToppings.length > 0) {
        const toppingsTotal = item.productTypeToppings.reduce(
          (toppingTotal, toppingItem) => {
            return (
              toppingTotal +
              parseFloat(toppingItem.topping.toppingPrice.toString()) *
                parseFloat(toppingItem.quantity.toString())
            );
          },
          0
        );
        itemTotal += toppingsTotal;
      }
      return total + itemTotal;
    }, 0);
  };

  const addProduct = (item: Product, mealIndex: number, type: string) => {
    // If the product has toppings, open the topping dialog
    if (item.haveTopping) {
      openToppingDialog(item, mealIndex);
    } else {
      // Add the product to the meal directly if no toppings
      addProductToMeal(item, mealIndex);
    }

    // Update total price for all meals in the catering event
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    cateringEvent.value.cashierAmount = totalEventPrice;
  };

  const openToppingDialog = (item: Product, mealIndex: number) => {
    posStore.toppingDialog = true;
    selectItemEdit.value = {
      receiptItemId: 0,
      productTypeToppings: [],
      product: item,
      quantity: 0,
      receiptSubTotal: 0,
    };
    selectedMealIndex.value = mealIndex; // Store the mealIndex to ensure you update the correct meal
  };

  const addProductToMeal = (item: Product, mealIndex: number, quantity: number = 1) => {
    console.log("Adding product to meal:", item, mealIndex);
    console.log(cateringEvent.value.meals![mealIndex]);
    
    
    const meal = cateringEvent.value.meals![mealIndex];
    
    // Ensure the receipt exists
    if (!meal.receipt) {
      meal.receipt = {
        receiptType: item.storeType,
        receiptTotalDiscount: 0,
        receiptNetPrice: 0,
        receiptStatus: "",
        createdReceipt: new Date(),
        receiptItems: [],
        receiptPromotions: [],
        receiptTotalPrice: 0,
        paymentMethod: "",
        change: 0,
        receive: 0,
        customer: {
          customerId: 0,
          customerName: "",
          customerPhone: "",
          customerNumberOfStamp: 0,
          createMemberDate: new Date(),
        },
      };
    }
  
    const receipt = meal.receipt; // Access the receipt object
  
    // Find an existing receipt item for the product
    const receiptItem = receipt.receiptItems.find(
      (ri) => ri.product?.productId === item.productId
    );
    console.log("Receipt item:", receiptItem);
    
  
    if (receiptItem) {
      // Update existing receipt item
      receiptItem.quantity += quantity;
      receiptItem.receiptSubTotal += item.productPrice * quantity;
  
      // Update meal product
      const mealProduct = meal.mealProducts.find(
        (mp) => mp.product.productId === item.productId
      );
      if (mealProduct) {
        mealProduct.quantity += quantity;
        mealProduct.totalPrice += item.productPrice * quantity;
      } else {
        // Add a new product to the meal
        meal.mealProducts.push({
          mealId: mealIndex,
          product: item,
          quantity: quantity,
          totalPrice: item.productPrice * quantity,
          type: item.storeType,
        });
      }
    } else {
      // Add a new receipt item if it doesn't exist
      receipt.receiptItems.push({
        receiptItemId: 0,
        productTypeToppings: [],
        product: item,
        quantity: quantity,
        receiptSubTotal: item.productPrice * quantity,
      });
  
      // Add the product to the meal
      meal.mealProducts.push({
        mealId: mealIndex,
        product: item,
        quantity: quantity,
        totalPrice: item.productPrice * quantity,
        type: item.storeType,
      });
    }
  
    // Update total price for the meal
    meal.totalPrice = receipt.receiptItems.reduce(
      (sum, item) => sum + item.receiptSubTotal,
      0
    );
  
    // Update total price for the catering event
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    cashierAmount.value = totalEventPrice;
  };
  


  const addToReceipt = (
    product: Product,
    productType: ProductType,
    productTypeToppings: ProductTypeTopping[],
    quantity: number,
    sweetness: number
  ) => {
    const parsedQuantity = parseInt(quantity.toString(), 10);
    const productPrice = parseInt(productType.productTypePrice.toString(), 10);
  
    // Use selected meal index
    const mealIndex = selectedMealIndex.value; // Assuming currentMealIndex holds the selected meal index

  
    // Initialize receipt in meal if not present
    if (!cateringEvent.value.meals![mealIndex].receipt) {
      cateringEvent.value.meals![mealIndex].receipt = {
        receiptItems: [],
        receiptTotalPrice: 0,
        receiptNetPrice: 0,
        receiptTotalDiscount: 0,
        paymentMethod: "",
        change: 0,
        receive: 0,
        receiptStatus: "",
        createdReceipt: new Date(),
        receiptPromotions: [],
      };
    }
  
    // Access receipt items from the selected meal's receipt
    const receiptItems = cateringEvent.value.meals![mealIndex].receipt.receiptItems;
  
    // Find an existing item in the receipt based on product ID, sweetness, and toppings
    const existingItem = receiptItems.find(
      (item) =>
        item.product?.productId === product.productId &&
        item.sweetnessLevel === sweetness &&
        JSON.stringify(item.productTypeToppings) === JSON.stringify(productTypeToppings) &&
        item.productType?.productTypeName === productType.productTypeName
    );
  
    // If the product has toppings, calculate the total price of the toppings
    const toppingsTotal = productTypeToppings.reduce((toppingTotal, toppingItem) => {
      return (
        toppingTotal +
        parseFloat(toppingItem.topping.toppingPrice.toString()) * parseFloat(toppingItem.quantity.toString())
      );
    }, 0);
  
    // If the item already exists in the receipt, update its quantity and subtotal
    if (existingItem) {
      existingItem.quantity += parsedQuantity;
      existingItem.receiptSubTotal += (productPrice + toppingsTotal) * parsedQuantity;
      // update in product meal
      const mealProduct = cateringEvent.value.meals![mealIndex].mealProducts.find((mp) => mp.product.productId === product.productId);
      if (mealProduct) {
        mealProduct.quantity += parsedQuantity;
        mealProduct.totalPrice += (productPrice + toppingsTotal) * parsedQuantity;
      } else {
        cateringEvent.value.meals![mealIndex].mealProducts.push({
          mealId: mealIndex,
          product: product,
          quantity: parsedQuantity,
          totalPrice: (productPrice + toppingsTotal) * parsedQuantity,
          type: productType.productTypeName,
        });
      }
    } else {
      // If the item does not exist, add it as a new receipt item
      receiptItems.push({
        receiptItemId: 0,
        productTypeToppings: productTypeToppings,
        product: product,
        quantity: parsedQuantity,
        receiptSubTotal: (productPrice + toppingsTotal) * parsedQuantity,
        sweetnessLevel: sweetness,
        productType: productType,
      });
      // Add the product to the meal
      cateringEvent.value.meals![mealIndex].mealProducts.push({
        mealId: mealIndex,
        product: product,
        quantity: parsedQuantity,
        totalPrice: (productPrice + toppingsTotal) * parsedQuantity,
        type: productType.productTypeName,
      });
    }
  
    // Update the total price for the meal by recalculating based on all meal products
    cateringEvent.value.meals![mealIndex].totalPrice = receiptItems.reduce((sum, item) => sum + item.receiptSubTotal, 0);
  
    // Update the total price for the entire catering event by summing up all meals' total prices
    const totalEventPrice = cateringEvent.value.meals!.reduce((sum, meal) => sum + meal.totalPrice, 0);
    cateringEvent.value.cashierAmount = totalEventPrice;
  
    console.log("Updated catering event:", cateringEvent.value);
  };
  

  return {
    fetchMeals,
    saveMeals,
    addMeal,
    removeMeal,
    removeIngredientFromMeal,
    createCateringEvent,
    cateringEvent,
    riceReceipt,
    coffeeReceipt,
    addProductToMeal,
    selectItemEdit,
    addProduct,
    addToReceipt,
    cashierAmount,
  };
});
