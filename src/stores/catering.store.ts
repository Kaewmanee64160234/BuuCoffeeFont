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
import receiptService from "@/service/receipt.service";
import cateringService from "@/service/catering.service";

export const useCateringStore = defineStore("catering", () => {
  const meals = ref<Meal[]>([]);
  const userStore = useUserStore();
  const selectedMealIndex = ref<number>(0);
  const cashierAmount = ref<number>(0);
  const cateringReceiptItemDialog = ref<boolean>(false);
  const cateringProductDialog = ref<boolean>(false);
  const filteredReceiptItems = ref<ReceiptItem[]>([]);
  const productsCatering = ref<Product[]>([]);
  const productCatering = ref<Product>({
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
      console.log("Creating catering event:", JSON.stringify(cateringEvent.value));
      // create recipt status catering 
     
    
      for (const meal of cateringEvent.value.meals!) {
        if (!meal.receipt) {
          // กรัณาใส่รายการอาหารอย่างน้อย 1
          Swal.fire("Error", "กรุณาใส่รายการอาหารอย่างน้อย 1 อย่าง", "error");
          return;
        }
        // meal name charactor morthat 3
        if (meal.mealName.length < 3) {
          Swal.fire("Error", "ชื่ออาหารต้องมีอย่างน้อย 3 ตัวอักษร", "error");
          return;

        }
        // input time
        if (meal.mealTime.length < 1) {
          Swal.fire("Error", "กรุณาใส่เวลา", "error");
          return;

        }
        const reciptItemCoffee = ref<ReceiptItem[]>([]);
        const reciptItemRice = ref<ReceiptItem[]>([]);
        for(const item of meal.receipt.receiptItems){
          if(item.product?.storeType == "ร้านกาแฟ"){
            reciptItemCoffee.value.push(item);
          }
          else{
            reciptItemRice.value.push(item);
          }

        }
        // create recipt 
        const receiptCoffee: Receipt = {
          receiptTotalPrice: reciptItemCoffee.value.reduce((sum, item) => sum + item.receiptSubTotal, 0),
          receiptType: "ร้านกาแฟ",
          receiptTotalDiscount: 0,
          receiptNetPrice: reciptItemCoffee.value.reduce((sum, item) => sum + item.receiptSubTotal, 0),
          receiptStatus: "ร้านจัดเลี้ยง",
          queueNumber: 0,
          receive: 0,
          change: 0,
          receiptItems: reciptItemCoffee.value,
          receiptPromotions: [],
          createdDate: cateringEvent.value.createdDate,
          checkIngredientId: 0
        };
        // calculate total and set up
        // rice recipt
        const receiptRice: Receipt = {
          receiptTotalPrice: reciptItemRice.value.reduce((sum, item) => sum + item.receiptSubTotal, 0),
          receiptType: "ร้านข้าว",
          receiptTotalDiscount: 0,
          receiptNetPrice: reciptItemRice.value.reduce((sum, item) => sum + item.receiptSubTotal, 0),
          receiptStatus: "ร้านจัดเลี้ยง",
          queueNumber: 0,
          receive: 0,
          change: 0,
          receiptItems: reciptItemRice.value,
          receiptPromotions: [],
          createdDate: cateringEvent.value.createdDate,
          checkIngredientId: 0
        };
        console.log( "recipt Coffee", receiptCoffee);
        console.log( "recipt Rice", receiptRice);
        
        // calculate total and set up
        meal.receipt = receiptCoffee;
        const responseCoffee  = await receiptService.createReceipt(receiptCoffee);
        console.log("Receipt created successfully", responseCoffee.data);
        const responseRice  = await receiptService.createReceipt(receiptRice);
        console.log("Receipt created successfully", responseRice.data);
        if(responseCoffee.status === 201 && responseRice.status === 201){
          console.log("Receipt created successfully", responseCoffee.data);
          console.log("Receipt created successfully", responseRice.data);
        }
        


   
      }
      console.log("Creating catering event:", cateringEvent.value);
      const responseEvent = await cateringService.createCateringEvent(cateringEvent.value);
      if (responseEvent.status === 201) {
        console.log("Catering event created successfully", responseEvent.data);
        clearData();
      }

      
      Swal.fire("Success", "Catering event created successfully", "success");
    } catch (error) {
      console.error("Error creating catering event:", error);
      Swal.fire("Error", "Error creating catering event", "error");
    }
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
  
    const meal = cateringEvent.value.meals![mealIndex];
  
    // Ensure the receipt exists in the meal
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
  
    const receipt = meal.receipt;
  
    // Find existing receipt item for this product
    const receiptItem = receipt.receiptItems.find(ri => ri.product?.productId === item.productId);
  
    if (receiptItem) {
      // Update existing receipt item
      receiptItem.quantity += quantity;
      receiptItem.receiptSubTotal += item.productPrice * quantity;
    } else {
      // Add a new receipt item
      receipt.receiptItems.push({
        receiptItemId: 0,
        productTypeToppings: [],
        product: item,
        quantity: quantity,
        receiptSubTotal: item.productPrice * quantity,
      });
    }
  
    // Find or add meal product
    const mealProduct = meal.mealProducts.find(mp => mp.product.productId === item.productId);
    if (mealProduct) {
      mealProduct.quantity += quantity;
      mealProduct.totalPrice += item.productPrice * quantity;
    } else {
      // Add new meal product
      meal.mealProducts.push({
        mealId: mealIndex,
        product: item,
        quantity: quantity,
        totalPrice: item.productPrice * quantity,
        type: item.storeType,
      });
    }
  
    // Update total price for the meal
    meal.totalPrice = meal.receipt.receiptItems.reduce((sum, item) => sum + item.receiptSubTotal, 0);
  
    // Update total price for the catering event
    const totalEventPrice = cateringEvent.value.meals.reduce((sum, meal) => sum + meal.totalPrice, 0);
    cateringEvent.value.cashierAmount = totalEventPrice;
  
    console.log("Updated meal and catering event:", meal, cateringEvent.value);
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
  
    // Ensure `selectedMealIndex` has a valid value
    if (selectedMealIndex.value === null || selectedMealIndex.value === undefined) {
      console.error("No selected meal index.");
      return;
    }
  
    const mealIndex = selectedMealIndex.value;
    const meal = cateringEvent.value.meals![mealIndex];
  
    // Ensure the receipt exists in the meal
    if (!meal.receipt) {
      meal.receipt = {
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
  
    // Access receipt items from the meal's receipt
    const receiptItems = meal.receipt.receiptItems;
  
    // Find an existing meal product and receipt item
    const existingMealProduct = meal.mealProducts.find(mp => mp.product.productId === product.productId);
    const toppingsTotal = productTypeToppings.reduce((sum, topping) => {
      return sum + topping.topping.toppingPrice * topping.quantity;
    }, 0);
  
    if (existingMealProduct) {
      // Update existing meal product
      existingMealProduct.quantity += parsedQuantity;
      existingMealProduct.totalPrice += (productPrice + toppingsTotal) * parsedQuantity;
    } else {
      // Add new meal product
      meal.mealProducts.push({
        mealId: mealIndex,
        product: product,
        quantity: parsedQuantity,
        totalPrice: (productPrice + toppingsTotal) * parsedQuantity,
        type: productType.productTypeName,
      });
    }
  
    const existingReceiptItem = receiptItems.find(
      item =>
        item.product?.productId === product.productId &&
        item.sweetnessLevel === sweetness &&
        JSON.stringify(item.productTypeToppings) === JSON.stringify(productTypeToppings) &&
        item.productType?.productTypeId === productType.productTypeId
    );
  
    if (existingReceiptItem) {
      // Update existing receipt item
      existingReceiptItem.quantity += parsedQuantity;
      existingReceiptItem.receiptSubTotal += (productPrice + toppingsTotal) * parsedQuantity;
    } else {
      // Add a new receipt item
      receiptItems.push({
        receiptItemId: 0,
        productTypeToppings: productTypeToppings,
        product: product,
        quantity: parsedQuantity,
        receiptSubTotal: (productPrice + toppingsTotal) * parsedQuantity,
        sweetnessLevel: sweetness,
        productType: productType,
      });
    }
  
    // Update total price for the meal
    meal.totalPrice = receiptItems.reduce((sum, item) => sum + item.receiptSubTotal, 0);
  
    // Update total price for the entire catering event
    const totalEventPrice = cateringEvent.value.meals!.reduce((sum, meal) => sum + meal.totalPrice, 0);
    cateringEvent.value.cashierAmount = totalEventPrice;
  
    console.log("Updated catering event:", cateringEvent.value);
  };

  // calculate in reciptItem,
  const calculateReceiptItem = (receiptItem: ReceiptItem) => {
    const productPrice = receiptItem.product?.productPrice || 0;
    const toppingsTotal = receiptItem.productTypeToppings.reduce((sum, topping) => {
      return sum + topping.topping.toppingPrice * topping.quantity;
    }, 0);
    
    return productPrice + toppingsTotal;
  };

  // clear data catering
  const clearData = () => {
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
  
  };
  return {
    fetchMeals,
    saveMeals,
    addMeal,
    removeMeal,
    removeIngredientFromMeal,
    createCateringEvent,
    cateringEvent,
    addProductToMeal,
    selectItemEdit,
    addProduct,
    addToReceipt,
    cashierAmount,
    cateringReceiptItemDialog,
    filteredReceiptItems,
    calculateReceiptItem,
    productsCatering,
    productCatering,
    cateringProductDialog
  };
});
