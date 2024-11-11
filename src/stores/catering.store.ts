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
import { useCateringEventStore } from "./historycatering.store";

export const useCateringStore = defineStore("catering", () => {
  const meals = ref<Meal[]>([]);
  const userStore = useUserStore();
  const selectedMealIndex = ref<number>(0);
  const totalBudget = ref<number>(0);
  const cateringReceiptItemDialog = ref<boolean>(false);
  const cateringProductDialog = ref<boolean>(false);
  const filteredReceiptItems = ref<ReceiptItem[]>([]);
  const productsCatering = ref<Product[]>([]);
  const cateringHistory = ref<CateringEvent>();
  const cateringEventStore = useCateringEventStore();
  const mealProductEdit = ref<MealProduct>({
    mealId: 0,
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
    productName: "",
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
    totalBudget: 0,
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
      receipt: {
        // Initialize the receipt object here
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
      console.log(
        "Creating catering event:",
        JSON.stringify(cateringEvent.value)
      );
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
        for (const item of meal.receipt.receiptItems) {
          if (item.product?.storeType == "ร้านกาแฟ") {
            reciptItemCoffee.value.push(item);
          }
          if (item.product?.storeType == "ร้านข้าว") {
            reciptItemRice.value.push(item);
          }
        }
        // create recipt
        const receiptCoffee: Receipt = {
          receiptTotalPrice: reciptItemCoffee.value.reduce(
            (sum, item) => sum + item.receiptSubTotal,
            0
          ),
          receiptType: "ร้านกาแฟ",
          receiptTotalDiscount: 0,
          receiptNetPrice: reciptItemCoffee.value.reduce(
            (sum, item) => sum + item.receiptSubTotal,
            0
          ),
          receiptStatus: "ร้านจัดเลี้ยง",
          queueNumber: 0,
          receive: 0,
          change: 0,
          receiptItems: reciptItemCoffee.value,
          receiptPromotions: [],
          createdDate: cateringEvent.value.createdDate,
          checkIngredientId: 0,
        };
        // calculate total and set up
        // rice recipt
        const receiptRice: Receipt = {
          receiptTotalPrice: reciptItemRice.value.reduce(
            (sum, item) => sum + item.receiptSubTotal,
            0
          ),
          receiptType: "ร้านข้าว",
          receiptTotalDiscount: 0,
          receiptNetPrice: reciptItemRice.value.reduce(
            (sum, item) => sum + item.receiptSubTotal,
            0
          ),
          receiptStatus: "ร้านจัดเลี้ยง",
          queueNumber: 0,
          receive: 0,
          change: 0,
          receiptItems: reciptItemRice.value,
          receiptPromotions: [],
          createdDate: cateringEvent.value.createdDate,
          checkIngredientId: 0,
        };
        console.log("recipt Coffee", receiptCoffee);
        console.log("recipt Rice", receiptRice);

        // calculate total and set up
        meal.receipt = receiptCoffee;
        const responseCoffee = await receiptService.createReceipt(
          receiptCoffee
        );
        console.log("Receipt created successfully", responseCoffee.data);
        const responseRice = await receiptService.createReceipt(receiptRice);
        console.log("Receipt created successfully", responseRice.data);
        if (responseCoffee.status === 201 && responseRice.status === 201) {
          cateringEvent.value.coffeeReceiptId = responseCoffee.data.receiptId;
          cateringEvent.value.riceReceiptId = responseRice.data.receiptId;
        }
      }
      console.log("Creating catering event:", cateringEvent.value);
      const responseEvent = await cateringService.createCateringEvent(
        cateringEvent.value
      );
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

  const checkInventory = async (
    productId: number,
    requiredQuantity: number,
    storeType: string
  ): Promise<boolean> => {
    let inventory: any;
  
    // Fetch the correct inventory based on the store type
    if (storeType === "ร้านกาแฟ") {
      inventory = await cateringService.getSubInventoriesCoffeeByProductId(
        productId
      );
    console.log("Inventory data:", inventory);

    } else if (storeType === "ร้านข้าว") {
      inventory = await cateringService.getSubInventoriesRiceByProductId(
        productId
      );
    }
    
  
    // Calculate available inventory considering reserved quantity
    const availableQuantity = inventory.data.quantity - inventory.data.reservedQuantity;
  
    // Return true if enough inventory is available, otherwise false
    return availableQuantity >= requiredQuantity;
  };
  
  const addProductToMeal = async (
    item: Product,
    mealIndex: number,
    quantity: number = 1
  ) => {
    console.log("Adding product to meal:", item, mealIndex);
  
    // Check conditions for haveTopping and needLinkIngredient
    if (item.haveTopping === false && item.needLinkIngredient === true) {
      console.log("Checking inventory for linked ingredient...");
  
      if (item.storeType !== "เลี้ยงรับรอง") {
        // Calculate the total required quantity of the product across all meals
        const totalQuantityInCateringEvent = cateringEvent.value.meals
          ?.flatMap((meal) => meal.mealProducts)
          .filter((mp) => mp.product?.productId === item.productId)
          .reduce((acc, mp) => acc + mp.quantity, 0) || 0;
  
        // Add the requested quantity to the current total
        const totalRequiredQuantity = totalQuantityInCateringEvent + quantity;
  
        // Check if adding this quantity exceeds available inventory
        const sufficientInventory = await checkInventory(
          item.productId,
          totalRequiredQuantity,
          item.storeType
        );
        if (!sufficientInventory) {
          Swal.fire(
            "สต็อกไม่เพียงพอ",
            "สต็อกไม่เพียงพอสำหรับการเพิ่มสินค้านี้",
            "error"
          );
          return;
        }
      }
    }
  
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
    const receiptItem = receipt.receiptItems.find(
      (ri) => ri.product?.productName === item.productName
    );
  
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
    const mealProduct = meal.mealProducts.find(
      (mp) => mp.product!.productName === item.productName
    );
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
  
    calculateTotalPrice(mealIndex);
  
    console.log("Updated meal and catering event:", meal, cateringEvent.value);
  };
  

  const addProduct = (item: Product, mealIndex: number, type: string) => {
    if (item.haveTopping) {
      openToppingDialog(item, mealIndex);
    } else {
      addProductToMeal(item, mealIndex);
    }

    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    cateringEvent.value.totalBudget = totalEventPrice;
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



  const calculateTotalPrice = (mealIndex: number) => {
    const meal = cateringEvent.value.meals![mealIndex];

    // Calculate total price for the meal based on current mealProducts
    meal.totalPrice = meal.mealProducts.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // Calculate total price for the entire catering event
    const totalEventPrice = cateringEvent.value.meals.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );

    cateringEvent.value.totalBudget = totalEventPrice;
    console.log(
      "mealProducts3",
      cateringEvent.value.meals![selectedMealIndex.value].mealProducts
    );
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
    if (
      selectedMealIndex.value === null ||
      selectedMealIndex.value === undefined
    ) {
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
    const existingMealProduct = meal.mealProducts.find(
      (mp) => mp.product!.productId === product.productId
    );
    const toppingsTotal = productTypeToppings.reduce((sum, topping) => {
      return sum + topping.topping.toppingPrice * topping.quantity;
    }, 0);

    if (existingMealProduct) {
      // Update existing meal product
      existingMealProduct.quantity += parsedQuantity;
      existingMealProduct.totalPrice +=
        (productPrice + toppingsTotal) * parsedQuantity;
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
      (item) =>
        item.product?.productId === product.productId &&
        item.sweetnessLevel === sweetness &&
        JSON.stringify(item.productTypeToppings) ===
          JSON.stringify(productTypeToppings) &&
        item.productType?.productTypeId === productType.productTypeId
    );

    if (existingReceiptItem) {
      // Update existing receipt item
      existingReceiptItem.quantity += parsedQuantity;
      existingReceiptItem.receiptSubTotal +=
        (productPrice + toppingsTotal) * parsedQuantity;
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
    meal.totalPrice = receiptItems.reduce(
      (sum, item) => sum + item.receiptSubTotal,
      0
    );

    // Update total price for the entire catering event
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    cateringEvent.value.totalBudget = totalEventPrice;

    console.log("Updated catering event:", cateringEvent.value);
  };

  // calculate in reciptItem,
  const calculateReceiptItem = (receiptItem: ReceiptItem) => {
    const productPrice = receiptItem.product?.productPrice || 0;
    const toppingsTotal = receiptItem.productTypeToppings.reduce(
      (sum, topping) => {
        return sum + topping.topping.toppingPrice * topping.quantity;
      },
      0
    );

    return productPrice + toppingsTotal;
  };

  // clear data catering
  const clearData = () => {
    cateringEvent.value = {
      cashierId: 0,
      totalBudget: 0,
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

  const addProductCateringInCaterings = (item: MealProduct) => {
    mealProductEdit.value = item;
    const meal = cateringEvent.value.meals![selectedMealIndex.value];

    const productMeal = meal.mealProducts.find(
      (mp) => mp.product?.productName === item.productName
    );

    if (productMeal) {
      productMeal.quantity += 1;
      productMeal.totalPrice += item.productPrice!;
    } else {
      meal.mealProducts.push({
        mealId: selectedMealIndex.value,
        product: {
          productId: item.product?.productId!,
          productName: item.productName,
          barcode: "",
          countingPoint: false,
          storeType: "เลี้ยงรับรอง",
          category: {
            categoryId: 0,
            categoryName: "",
          },
          haveTopping: false,
          productImage: "",
          productPrice: item.productPrice!,
        },
        quantity: parseInt(item.quantity! + ""),
        totalPrice:
          parseInt(item.productPrice + "") * parseInt(item.quantity! + ""),
        type: "เลี้ยงรับรอง",
        productName: item.productName,
        productPrice: item.productPrice,
      });
    }

    cateringProductDialog.value = false;
    // clear data
    mealProductEdit.value = {
      productId: 0,
      productName: "",
      barcode: "",
      countingPoint: false,
      storeType: "เลี้ยงรับรอง",
      category: {
        categoryId: 0,
        categoryName: "",
      },
      haveTopping: false,
      productImage: "",
      productPrice: 0,
    };

    calculateTotalPrice(selectedMealIndex.value);
  };

  // updateTotalPrice
  const updateTotalPrice = () => {
    const meal = cateringEvent.value.meals![selectedMealIndex.value];
    meal.totalPrice = meal.mealProducts.reduce(
      (sum, mealProduct) => sum + mealProduct.totalPrice,
      0
    );
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    cateringEvent.value.totalBudget = totalEventPrice;
    cateringEvent.value.meals![selectedMealIndex.value] = meal;
  };
  const calculateSubtotal = (item: ReceiptItem) => {
    let subtotal = item.productType?.productTypePrice! * item.quantity;

    if (item.product?.haveTopping && item.productTypeToppings) {
      const toppingsTotal = item.productTypeToppings.reduce(
        (total, topping) => {
          return total + topping.topping.toppingPrice * topping.quantity;
        },
        0
      );
      subtotal += toppingsTotal * item.quantity;
    }
    return subtotal;
  };
  const syncMealProduct = (item: ReceiptItem) => {
    const selectedMeal = cateringEvent.value.meals![selectedMealIndex.value];

    selectedMeal.mealProducts.forEach((mealProduct) => {
      // find from recipt item
      const associatedReceiptItems = selectedMeal.receipt?.receiptItems.filter(
        (receiptItem) =>
          receiptItem.product?.productName === mealProduct.product?.productName
      );
      console.log("associatedReceiptItems", associatedReceiptItems);

      console.log("associatedReceiptItems", associatedReceiptItems);
      if (associatedReceiptItems.length === 0) {
        const mealContainerProduct = selectedMeal.mealProducts.find((mp) => {
          return mp.product?.productName === item.product?.productName;
        });
        const itemInReceipt = selectedMeal.receipt?.receiptItems.find((ri) => {
          return ri.product?.productName === item.product?.productName;
        });
        if (!itemInReceipt && mealContainerProduct) {
          const mealProductIndex = selectedMeal.mealProducts.findIndex((mp) => {
            return mp.product?.productName === item.product?.productName;
          });
          selectedMeal.mealProducts.splice(mealProductIndex, 1);
          cateringReceiptItemDialog.value = false;
        }
      } else {
        mealProduct.quantity = associatedReceiptItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        mealProduct.totalPrice = associatedReceiptItems.reduce(
          (sum, item) => sum + item.receiptSubTotal,
          0
        );
      }
    });

    selectedMeal.totalPrice = selectedMeal.mealProducts.reduce(
      (total, mealProduct) => total + mealProduct.totalPrice,
      0
    );
    console.log(
      "mealProducts2",
      cateringEvent.value.meals![selectedMealIndex.value].mealProducts
    );
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
    totalBudget,
    cateringReceiptItemDialog,
    filteredReceiptItems,
    calculateReceiptItem,
    productsCatering,
    mealProductEdit,
    cateringProductDialog,
    addProductCateringInCaterings,
    selectedMealIndex,
    updateTotalPrice,
    calculateSubtotal,
    syncMealProduct,
    calculateTotalPrice,
    cateringHistory,
  };
});
