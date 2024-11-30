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
import { prototype } from "apexcharts";

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
  const findCateringEventById = async (cashierId: number) => {
    try {
      // Fetch the main catering event
      const response = await cateringService.findCateringEventById(cashierId);
      cateringEvent.value = response.data;
      totalBudget.value = cateringEvent.value.totalBudget;
      console.log("Catering event:", cateringEvent.value);
    } catch (error) {
      console.error("Failed to fetch catering event:", error);
    }
  };
  const createCateringEvent = async () => {
    try {
      cateringEvent.value.user = userStore.currentUser;

      for (const meal of cateringEvent.value.meals!) {
        // Validate meal requirements
        if (!meal.mealProducts || meal.mealProducts.length === 0) {
          Swal.fire("Error", "กรุณาใส่รายการอาหารอย่างน้อย 1 อย่าง", "error");
          return;
        }

        if (meal.mealName.length < 3) {
          Swal.fire("Error", "ชื่ออาหารต้องมีอย่างน้อย 3 ตัวอักษร", "error");
          return;
        }

        if (meal.mealTime.length < 1) {
          Swal.fire("Error", "กรุณาใส่เวลา", "error");
          return;
        }

        // Ensure receipt exists
        if (!meal.receipt || !meal.receipt.receiptItems) {
          Swal.fire("Error", "Receipt data is missing for this meal.", "error");
          return;
        }

        // Filter receipt items for coffee and rice
        const coffeeReceiptItems = meal.receipt.receiptItems.filter(
          (item) => item.product?.storeType === "ร้านกาแฟ"
        );
        const riceReceiptItems = meal.receipt.receiptItems.filter(
          (item) => item.product?.storeType === "ร้านข้าว"
        );

        // Helper to create a receipt
        const createReceipt = async (
          receiptItems: ReceiptItem[],
          receiptType: string
        ) => {
          const receiptTotalPrice = receiptItems.reduce(
            (sum, item) => sum + item.receiptSubTotal,
            0
          );

          const receipt: Receipt = {
            receiptTotalPrice,
            receiptType,
            receiptTotalDiscount: 0,
            receiptNetPrice: receiptTotalPrice, // Assuming no discounts
            receiptStatus: "เลี้ยงรับรอง",
            queueNumber: 0,
            receive: 0,
            change: 0,
            receiptItems,
            receiptPromotions: [],
            createdDate: cateringEvent.value.createdDate,
            checkIngredientId: 0,
          };

          console.log(`Receipt for ${receiptType}:`, receipt);

          const response = await receiptService.createReceipt(receipt);
          if (response.status === 201) {
            console.log(
              `${receiptType} receipt created successfully:`,
              response.data
            );
            return response.data;
          } else {
            throw new Error(`Failed to create ${receiptType} receipt`);
          }
        };

        // Create coffee receipt if applicable
        if (coffeeReceiptItems.length > 0) {
          const coffeeReceipt = await createReceipt(
            coffeeReceiptItems,
            "ร้านกาแฟ"
          );
          meal.coffeeReceiptId = coffeeReceipt.receiptId;

          // Map receipt items back to meal products
          meal.mealProducts = meal.mealProducts.map((mealProduct) => {
            const matchingReceiptItem = coffeeReceipt.receiptItems.find(
              (item: ReceiptItem) =>
                item.product?.productName === mealProduct.product?.productName
            );
            if (matchingReceiptItem) {
              mealProduct.receiptItems = [matchingReceiptItem];
              mealProduct.receiptItemIds = [matchingReceiptItem.receiptItemId];
            }
            return mealProduct;
          });
        }

        // Create rice receipt if applicable
        if (riceReceiptItems.length > 0) {
          const riceReceipt = await createReceipt(riceReceiptItems, "ร้านข้าว");
          meal.riceReceiptId = riceReceipt.receiptId;

          // Map receipt items back to meal products
          meal.mealProducts = meal.mealProducts.map((mealProduct) => {
            const matchingReceiptItem = riceReceipt.receiptItems.find(
              (item: ReceiptItem) =>
                item.product?.productName === mealProduct.product?.productName
            );
            if (matchingReceiptItem) {
              mealProduct.receiptItems = [matchingReceiptItem];
              mealProduct.receiptItemIds = [matchingReceiptItem.receiptItemId];
            }
            return mealProduct;
          });
        }
      }

      // Create the catering event
      console.log("Catering event all:", JSON.stringify(cateringEvent.value));
      const responseEvent = await cateringService.createCateringEvent(
        cateringEvent.value
      );

      if (responseEvent.status === 201) {
        console.log("Catering event created successfully", responseEvent.data);
        clearData();
        Swal.fire("Success", "Catering event created successfully", "success");
      }
    } catch (error) {
      console.error("Error creating catering event:", error);
      Swal.fire("Error", "Error creating catering event", "error");
    }
  };

  // update catering

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
    const availableQuantity =
      inventory.data.quantity - inventory.data.reservedQuantity;

    // Return true if enough inventory is available, otherwise false
    return availableQuantity >= requiredQuantity;
  };

  const addProductToMeal = async (
    item: Product,
    mealIndex: number,
    quantity: number = 1
  ) => {
    console.log("Adding product to meal:", item, mealIndex);

    // have topping ??
    if (item.haveTopping === false && item.needLinkIngredient === true) {
      console.log("Checking inventory for linked ingredient...");
      // Product from store ??
      if (item.storeType !== "เลี้ยงรับรอง") {
        const totalQuantityInCateringEvent =
          cateringEvent.value.meals
            ?.flatMap((meal) => meal.mealProducts)
            .filter((mp) => mp.product?.productId === item.productId)
            .reduce((acc, mp) => acc + (mp.quantity || 0), 0) || 0;

        const totalRequiredQuantity = totalQuantityInCateringEvent + quantity;

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

    const receiptItem = receipt.receiptItems.find(
      (ri) => ri.product?.productName === item.productName
    );

    if (receiptItem) {
      receiptItem.quantity += quantity;
      receiptItem.receiptSubTotal = parseFloat(
        receiptItem.receiptSubTotal + item.productPrice * quantity + ""
      );
    } else {
      receipt.receiptItems.push({
        receiptItemId: 0,
        productTypeToppings: [],
        product: item,
        quantity: quantity,
        receiptSubTotal: parseFloat(item.productPrice * quantity + ""),
      });
    }

    const mealProduct = meal.mealProducts.find((mp) =>
      mp.product
        ? mp.product.productId === item.productId
        : mp.productName === item.productName
    );

    if (mealProduct) {
      const currentTotalPrice = parseFloat(mealProduct.totalPrice + "");
      const additionalPrice = parseFloat(item.productPrice) * quantity;

      mealProduct.quantity += quantity;
      mealProduct.totalPrice = parseFloat(currentTotalPrice + additionalPrice);

      console.log("mealProduct totalPrice", mealProduct.totalPrice);
    } else {
      meal.mealProducts.push({
        mealId: mealIndex,
        product: item,
        quantity: quantity,
        totalPrice: parseFloat(item.productPrice + "") * quantity,
        type: item.storeType,
      });
    }

    calculateTotalPrice(mealIndex);

    console.log("Updated meal and catering event:", meal, cateringEvent.value);
  };

  const calculateTotalPrice = (mealIndex: number) => {
    const meal = cateringEvent.value.meals![mealIndex];


    // Calculate the meal's total price by summing up its mealProducts' totalPrice
    meal.totalPrice = meal.mealProducts.reduce(
      (sum, item) => parseFloat(sum + "") + parseFloat(item.totalPrice + ""), // Default to 0 if totalPrice is undefined
      0 // Initial accumulator value
    );

    // Calculate the total event price by summing up all meals' totalPrice
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => parseFloat(sum + "") + parseFloat(meal.totalPrice + ""), // Default to 0 if totalPrice is undefined
      0 // Initial accumulator valuefr
    );

    totalBudget.value = totalEventPrice;

    console.log(
      "Updated meal products:",
      cateringEvent.value.meals![mealIndex].mealProducts
    );
    console.log("Updated meal total price:", meal.totalPrice);
    console.log(
      "Updated total event price (totalBudget):",
      totalBudget.value
    );
  };

  const addProduct = (item: Product, mealIndex: number, type: string) => {
    if (item.haveTopping) {
      openToppingDialog(item, mealIndex);
    } else {
      addProductToMeal(item, mealIndex);
    }

    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => parseFloat(sum + "") + parseFloat(meal.totalPrice + ""),
      0
    );
    totalBudget.value = totalEventPrice;
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
    selectedMealIndex.value = mealIndex;
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
  
    // Ensure `selectedMealIndex` is valid
    if (
      selectedMealIndex.value === null ||
      selectedMealIndex.value === undefined
    ) {
      console.error("No selected meal index.");
      return;
    }
  
    const mealIndex = selectedMealIndex.value;
    const meal = cateringEvent.value.meals![mealIndex];
  
    // Ensure receipt exists in the meal
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
  
    const toppingsTotal = productTypeToppings.reduce((sum, topping) => {
      return (
        parseFloat(sum+'') +
        parseInt(topping.topping.toppingPrice.toString(), 10) *
          parseInt(topping.quantity.toString(), 10)
      );
    }, 0);
  
    const totalPricePerUnit = parseFloat(productPrice+'') + parseFloat(toppingsTotal+'');
  
    // Handle mealProducts
    const existingMealProduct = meal.mealProducts.find(
      (mp) => mp.product!.productId === product.productId
    );
  
    if (existingMealProduct) {
      console.log("Existing meal product:", existingMealProduct);
      
      // Update existing meal product
      existingMealProduct.quantity = parseInt(parsedQuantity+'') + parseInt(existingMealProduct.quantity+'');
      existingMealProduct.totalPrice = (parseFloat(totalPricePerUnit+'') * parseInt(parsedQuantity+'') )+ parseFloat(existingMealProduct.totalPrice+'');
      console.log("Existing meal product:", existingMealProduct);
      
    } else {
      // Add new meal product
      meal.mealProducts.push({
        mealId: mealIndex,
        product: product,
        quantity: parsedQuantity,
        totalPrice: parseFloat(totalPricePerUnit+'') * parseInt(parsedQuantity+''),
        type: product.haveTopping ? product.storeType : "เลี้ยงรับรอง",
      });
    }
  
    // Handle receiptItems
    const existingReceiptItem = meal.receipt!.receiptItems.find(
      (item) =>
        item.product?.productId === product.productId &&
        item.sweetnessLevel === sweetness &&
        JSON.stringify(item.productTypeToppings) ===
          JSON.stringify(productTypeToppings) &&
        item.productType?.productTypeId === productType.productTypeId
    );
  
    if (existingReceiptItem) {
      // Update existing receipt item
      existingReceiptItem.quantity += parseInt(parsedQuantity+'');
      existingReceiptItem.receiptSubTotal += parseInt(totalPricePerUnit+'') * parseInt(parsedQuantity+'');
    } else {
      // Add new receipt item
      meal.receipt.receiptItems.push({
        receiptItemId: 0,
        productTypeToppings: productTypeToppings,
        product: product,
        quantity: parsedQuantity,
        receiptSubTotal: parseInt(totalPricePerUnit+'') * parseFloat(parsedQuantity+''),
        sweetnessLevel: sweetness,
        productType: productType,
      });
    }
  
    // Update meal and receipt totals
    meal.totalPrice = meal.mealProducts.reduce(
      (sum, product) => parseFloat(sum+"") + parseFloat(product.totalPrice+''),
      0
    );
  
    meal.receipt.receiptTotalPrice = meal.receipt.receiptItems.reduce(
      (sum, item) => parseFloat(sum+'') + parseFloat(item.receiptSubTotal+''),
      0
    );
  
    // Update total catering event budget
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => parseFloat(sum+'') + parseFloat(meal.totalPrice+''),
      0
    );
    totalBudget.value = totalEventPrice;
  
    console.log("Updated meal:", meal);
    console.log("Updated catering event:", cateringEvent.value);
    calculateTotalPrice(mealIndex);
  };
  

  // calculate in reciptItem,
  const calculateReceiptItem = (receiptItem: ReceiptItem) => {
    const productPrice = receiptItem.product?.productPrice || 0;
    const toppingsTotal = receiptItem.productTypeToppings.reduce(
      (sum, topping) => {
        return (
          parseFloat(sum + "") +
          parseFloat(topping.topping.toppingPrice + "") *
            parseInt(topping.quantity + "")
        );
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
      productMeal.totalPrice += parseFloat(item.productPrice! + "");
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
      (sum, mealProduct) =>
        parseFloat(sum + "") + parseFloat(mealProduct.totalPrice + ""),
      0
    );
    const totalEventPrice = cateringEvent.value.meals!.reduce(
      (sum, meal) => parseFloat(sum + "") + parseFloat(meal.totalPrice + ""),
      0
    );
    totalBudget.value = totalEventPrice;
    cateringEvent.value.meals![selectedMealIndex.value] = meal;
  };

  const calculateSubtotal = (item: ReceiptItem) => {
    let subtotal =
      parseFloat(item.productType?.productTypePrice! + "") *
      parseInt(item.quantity + "");

    if (item.product?.haveTopping && item.productTypeToppings) {
      const toppingsTotal = item.productTypeToppings.reduce(
        (total, topping) => {
          return (
            parseFloat(total + "") +
            parseFloat(topping.topping.toppingPrice + "") *
              parseInt(topping.quantity + "")
          );
        },
        0
      );
      subtotal += parseFloat(toppingsTotal + "") * parseInt(item.quantity + "");
    }
    return subtotal;
  };

  const syncMealProduct = (item: ReceiptItem) => {
    const selectedMeal = cateringEvent.value.meals![selectedMealIndex.value];
  
    const updateMealProduct = (associatedReceiptItems: ReceiptItem[], mealProduct: any) => {
      if (associatedReceiptItems.length === 0) {
        const mealContainerProduct = selectedMeal.mealProducts.find(
          (mp) => mp.product?.productName === item.product?.productName
        );
        const itemInReceipt = selectedMeal.receipt?.receiptItems.find(
          (ri) => ri.product?.productName === item.product?.productName
        );
        if (!itemInReceipt && mealContainerProduct) {
          const mealProductIndex = selectedMeal.mealProducts.findIndex(
            (mp) => mp.product?.productName === item.product?.productName
          );
          selectedMeal.mealProducts.splice(mealProductIndex, 1);
          cateringReceiptItemDialog.value = false;
        }
      } else {
        mealProduct.quantity = associatedReceiptItems.reduce((sum, ri) => sum + ri.quantity, 0);
        mealProduct.totalPrice = associatedReceiptItems.reduce(
          (sum, ri) => parseFloat(sum+'') + parseFloat( ri.receiptSubTotal+''),
          0
        );
      }
    };
  
    selectedMeal.mealProducts.forEach((mealProduct) => {
      let associatedReceiptItems: ReceiptItem[] = [];
      if (mealProduct.mealId === 0) {
        associatedReceiptItems = selectedMeal.receipt?.receiptItems.filter(
          (receiptItem) =>
            receiptItem.product?.productName === mealProduct.product?.productName
        ) || [];
      } else if (item.product?.storeType === "ร้านกาแฟ") {
        associatedReceiptItems = selectedMeal.coffeeReceipt?.receiptItems.filter(
          (receiptItem) =>
            receiptItem.product?.productName === mealProduct.product?.productName
        ) || [];
      } else if (item.product?.storeType === "ร้านข้าว") {
        associatedReceiptItems = selectedMeal.riceReceipt?.receiptItems.filter(
          (receiptItem) =>
            receiptItem.product?.productName === mealProduct.product?.productName
        ) || [];
      }
  
      updateMealProduct(associatedReceiptItems, mealProduct);
    });
  
    selectedMeal.totalPrice = selectedMeal.mealProducts.reduce(
      (total, mealProduct) => parseFloat(total+'') + parseFloat(mealProduct.totalPrice+''),
      0
    );
  
    console.log(
      "Updated mealProducts:",
      cateringEvent.value.meals![selectedMealIndex.value].mealProducts
    );
  };
  
  const updateCateringEvent = async (caterId: number) => {
    try {
      const response = await cateringService.updateCateringEvent(
        caterId,
        cateringEvent.value
      );
      if (response.status === 200) {
        console.log("Catering event updated successfully", response.data);
        Swal.fire("Success", "Catering event updated successfully", "success");
      }
    } catch (error) {
      console.error("Error updating catering event:", error);
      Swal.fire("Error", "Error updating catering event", "error");
    }
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
    findCateringEventById,
    updateCateringEvent,
  };
});
