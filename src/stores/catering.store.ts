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
  // const meals = ref<Meal[]>([]);
  const mealProducts = ref<MealProduct[]>([]);
  const receiptItemsCoffee = ref<ReceiptItem[]>([]);
  const receiptItemsRice = ref<ReceiptItem[]>([]);
  const userStore = useUserStore();
  const coffeeReceipt = ref<Receipt>({
    receiptType: "",
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
  });
  const riceReceipt = ref<Receipt>({
    receiptType: "",
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
    meals: [],
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
  async function fetchMeals() {
    try {
      const response = await axios.get("/meals");
      cateringEvent.value.meals = response.data;
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  }

  function clearForm() {
    cateringEvent.value = {
      cashierId: 0,
      cashierAmount: 0,
      createdDate: new Date(),
      deletedAt: "",
      meals: [],
    };
  }


  async function saveMeals() {
    try {
      const response = await axios.post("/meals", cateringEvent.value.meals!);
      return response.data;
    } catch (error) {
      console.error("Error saving meals:", error);
    }
  }

  function addMeal() {
    cateringEvent.value.meals!.push({
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
    cateringEvent.value.meals![mealIndex].mealProducts.splice(
      ingredientIndex,
      1
    );
  }

  function removeMeal(index: number) {
    cateringEvent.value.meals!.splice(index, 1);
  }

  function addIngredientToMeal(mealIndex: number) {
    cateringEvent.value.meals![mealIndex].mealProducts.push({
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

  const createCateringEvent = async () => {
    try {
      cateringEvent.value.user = userStore.currentUser;
      console.log(JSON.stringify(cateringEvent));

      const response = await axios.post("/catering-events", cateringEvent);
      cateringEvent.value = response.data;
      Swal.fire("Success", "Catering event created successfully", "success");
    } catch (error) {
      console.error("Error creating catering event:", error);
      Swal.fire("Error", "Error creating catering event", "error");
    }
  };

  const calculateTotal = (receiptItems: ReceiptItem[]) => {
    return receiptItems.reduce((total, item) => {
      // Calculate the base product subtotal
      let itemTotal = item.receiptSubTotal;
  
      // Add the total price of the toppings
      if (item.productTypeToppings && item.productTypeToppings.length > 0) {
        const toppingsTotal = item.productTypeToppings.reduce((toppingTotal, toppingItem) => {
          return toppingTotal +
            parseFloat(toppingItem.topping.toppingPrice.toString()) *
            parseFloat(toppingItem.quantity.toString());
        }, 0);
        
        itemTotal += toppingsTotal; // Add toppings total to the base product total
      }
  
      return total + itemTotal;
    }, 0); // Start with a total of 0
  };
  // if have topping open dialog if not save to meal
  const addProduct = (item: Product, type: string) => {
    console.log(item.haveTopping);

    if (item.haveTopping === true) {
      posStore.toppingDialog = true;
      // find product in receiptItemsCoffee and receiptItemsRice
      const existingProduct = receiptItemsCoffee.value.find(
        (product) => product.product?.productId === item.productId
      );
      const existingProductRice = receiptItemsRice.value.find(
        (product) => product.product?.productId === item.productId
      );
      if (existingProduct) {
        selectItemEdit.value = existingProduct;
     

      } else if (existingProductRice) {
        selectItemEdit.value = existingProductRice;
        // set in receiptItemsRice and update quantity and new calculate total
        existingProductRice.quantity += 1;
        existingProductRice.receiptSubTotal =
          item.productPrice * existingProductRice.quantity;
      } else {
        selectItemEdit.value = {
          receiptItemId: 0,
          productTypeToppings: [],
          product: item,
          quantity: 0,
          receiptSubTotal: 0,
        };
      }
    } else {
      addProductToMeal(item, type);
     
    }
  };
//  save to meal 
  const addProductToMeal = (item: Product, type: string, quantity: number = 1) => {
    const mealIndex = cateringEvent.value.meals!.length - 1;
    const existingProduct = cateringEvent.value.meals![mealIndex].mealProducts.find(
      (product) => product.product.productId === item.productId
    );
  
    let count = quantity;
  
    if (existingProduct) {
      count = existingProduct.quantity + quantity;
      existingProduct.quantity = count;
      if (item.haveTopping) {
        existingProduct.totalPrice =
          item.productTypes![0].productTypePrice * count;
      } else {
        existingProduct.totalPrice = item.productPrice * count;
      }
    } else {
      if (item.haveTopping) {
        cateringEvent.value.meals![mealIndex].mealProducts.push({
          mealId: mealIndex,
          product: { ...item },
          quantity: count,
          totalPrice: item.productTypes![0].productTypePrice * count,
          type: type,
        });
      } else {
        cateringEvent.value.meals![mealIndex].mealProducts.push({
          mealId: mealIndex,
          product: { ...item },
          quantity: count,
          totalPrice: item.productPrice * count,
          type: type,
        });
      }
    }
  
    // Calculate and update the total price for the meal
    const total = cateringEvent.value.meals![mealIndex].mealProducts.reduce(
      (sum, product) => sum + product.totalPrice,
      0
    );
  
    cateringEvent.value.meals![mealIndex].totalPrice = total;
  
    // Update receipt based on store type
    if (item.storeType === "ร้านข้าว") {
      receiptItemsRice.value.push({
        receiptItemId: 0,
        productTypeToppings: [],
        product: item,
        quantity: count,
        receiptSubTotal: item.productPrice * count,
      });
    } else if (item.storeType === "ร้านกาแฟ") {
      if (item.haveTopping) {
        receiptItemsCoffee.value.push({
          receiptItemId: 0,
          productTypeToppings: [],
          product: item,
          quantity: count,
          receiptSubTotal: item.productTypes![0].productTypePrice * count,
        });
      } else {
        receiptItemsCoffee.value.push({
          receiptItemId: 0,
          productTypeToppings: [],
          product: item,
          quantity: count,
          receiptSubTotal: item.productPrice * count,
        });
      }
    }
  };
  

const addToReceipt = (
  product: Product,
  productType: ProductType,
  productTypeToppings: ProductTypeTopping[],
  quantity: number,
  sweetness: number
) => {
  const parsedQuantity = parseInt(quantity.toString(), 10);
  const productPrice = parseInt(product.productPrice.toString(), 10);

  let existingItem;
  const receiptItems =
    product.storeType === "coffee" ? receiptItemsCoffee.value : receiptItemsRice.value;

  if (product.haveTopping) {
    existingItem = receiptItems.find(
      (item) =>
        JSON.stringify(item.productTypeToppings) === JSON.stringify(productTypeToppings) &&
        item.product?.productId === product.productId &&
        item.sweetnessLevel === sweetness &&
        item.productType?.productTypeName === productType.productTypeName
    );
  } else {
    existingItem = receiptItems.find(
      (item) => item.product?.productId === product.productId
    );
  }

  if (existingItem) {
    if (product.haveTopping) {
      if (productTypeToppings.length > 0) {
        existingItem.quantity += parsedQuantity;
        const toppingsTotal = productTypeToppings.reduce(
          (toppingAcc, toppingItem) =>
            toppingAcc +
            parseFloat(toppingItem.topping.toppingPrice.toString()) *
              parseFloat(toppingItem.quantity.toString()),
          0
        );
        const itemTotal =
          parseFloat(productType.productTypePrice.toString()) * existingItem.quantity +
          toppingsTotal;
        existingItem.receiptSubTotal = itemTotal;
      } else {
        existingItem.receiptSubTotal +=
          parseFloat(productType.productTypePrice.toString()) * parsedQuantity;
        existingItem.quantity += parsedQuantity;
      }
    } else {
      existingItem.receiptSubTotal += productPrice * parsedQuantity;
      existingItem.quantity += parsedQuantity;
    }
  } else {
    const toppingsTotal = productTypeToppings.reduce((toppingAcc, toppingItem) => {
      return toppingAcc +
        parseFloat(toppingItem.topping.toppingPrice.toString()) *
        parseFloat(toppingItem.quantity.toString());
    }, 0);

    const newItem = {
      productTypeToppings: product.haveTopping ? productTypeToppings : [],
      quantity: parsedQuantity,
      receiptSubTotal:
        parseFloat(productType.productTypePrice.toString()) * parsedQuantity +
        toppingsTotal,
      product,
      sweetnessLevel: sweetness,
      productType: productType,
    };

    receiptItems.push(newItem);
  }

  console.log("last item", receiptItems[receiptItems.length - 1]);

  // Calculate totals for the respective receipt
  const totalPrice = calculateTotal(receiptItems);
  const receipt =
    product.storeType === "coffee" ? coffeeReceipt.value : riceReceipt.value;

  receipt.receiptTotalPrice = totalPrice;
  if (receipt.receiptTotalDiscount === 0) {
    receipt.receiptNetPrice = totalPrice;
  } else {
    receipt.receiptNetPrice = totalPrice - receipt.receiptTotalDiscount;
  }

  // Update mealProducts with quantity and total price (including toppings)
  addProductToMeal(product, productType.productTypeName, parsedQuantity);
};

  return {
    fetchMeals,
    saveMeals,
    addMeal,
    removeMeal,
    addIngredientToMeal,
    removeIngredientFromMeal,
    createCateringEvent,
    cateringEvent,
    mealProducts,
    riceReceipt,
    coffeeReceipt,
    addProductToMeal,
    selectItemEdit,
    addToReceipt,
    addProduct
  };
});
