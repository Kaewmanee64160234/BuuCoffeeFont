import { defineStore } from "pinia";
import { ref } from "vue";
import type { Product } from "@/types/product.type";
import type { ProductTypeTopping } from "@/types/productTypeTopping.type";
import type { ReceiptPromotion } from "@/types/receiptPromotion.type";
import type { Receipt, ReceiptItem } from "@/types/receipt.type";
import type { ProductType } from "@/types/productType.type";
import type { Topping } from "@/types/topping.type";
import { useProductStore } from "./product.store";
import receiptService from "@/service/receipt.service";
import type { Promotion } from "@/types/promotion.type";
import { useCustomerStore } from "./customer.store";
import Swal from "sweetalert2";
import { useUserStore } from "./user.store";
import { useReceiptStore } from "./receipt.store";
import cateringService from "@/service/catering.service";

export const usePosStore = defineStore("pos", () => {
  const selectedItems = ref<ReceiptItem[]>([]);
  const selectedItemsUsePromotion = ref<ReceiptItem[]>([]);
  const receiptPromotions = ref<ReceiptPromotion[]>([]);
  const queueReceipt = ref<Receipt[]>([]);
  const customerPhone = ref<string>("");
  const customerPoints = ref<number>(0);
  const totalDiscount = ref<number>(0);
  const totalPrice = ref<number>(0);
  const netPrice = ref<number>(0);
  const selectUsePointDialog = ref(false);
  const countingPromotion = ref<number>(0);
  const updateReceiptDialog = ref(false);
  const selectedItemForEdit = ref<ReceiptItem>();
  const receiptItemsRice = ref<ReceiptItem[]>([]);
  const receiptItemsCoffee = ref<ReceiptItem[]>([]);
  const receipt = ref<Receipt>({
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
    },
  });

  const currentReceipt = ref<Receipt>();

  const toppingDialog = ref(false);
  const selectedProduct = ref<Product | null>(null);
  const productStore = useProductStore();
  const receiptDialog = ref(false);
  const customerStore = useCustomerStore();
  const userStore = useUserStore();
  const queueNumber = ref(1);
  const ReceiptDialogPos = ref(false);
  const receiptStore = useReceiptStore();
  const hideNavigation = ref(false);


  // Load queue number from local storage
  const loadQueueNumber = () => {
    const storedQueueData = localStorage.getItem("queueData");
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based, so add 1
    const currentDateString = currentDate.toDateString();

    if (storedQueueData) {
      const { date, number } = JSON.parse(storedQueueData);

      // Reset the queue number to 1 on October 1st
      if (currentMonth === 8 && currentDay === 12) {
        queueNumber.value = 1;
        localStorage.setItem(
          "queueData",
          JSON.stringify({ date: currentDateString, number: queueNumber.value })
        );
      } else if (date === currentDateString) {
        queueNumber.value = number;
      } else {
        queueNumber.value = 1;
        localStorage.setItem(
          "queueData",
          JSON.stringify({ date: currentDateString, number: queueNumber.value })
        );
      }
    } else {
      localStorage.setItem(
        "queueData",
        JSON.stringify({ date: currentDateString, number: queueNumber.value })
      );
    }
  };

  // Save queue number to local storage
  const saveQueueNumber = () => {
    const currentDateString = new Date().toDateString();
    localStorage.setItem(
      "queueData",
      JSON.stringify({ date: currentDateString, number: queueNumber.value })
    );
  };

  // toggleNavigation
  const toggleNavigation = () => {
    hideNavigation.value = !hideNavigation.value;
  };

  const addToReceipt = async (
    product: Product,
    productType: ProductType,
    productTypeToppings: ProductTypeTopping[],
    quantity: number,
    sweetness: number
  ) => {
    const parsedQuantity = parseInt(quantity.toString(), 10);
    const productPrice = parseInt(product.productPrice.toString(), 10);
  
    // Check if inventory is sufficient before adding, specifically for products with `haveTopping = false` and `needLinkIngredient = true`
    if (product.haveTopping === false && product.needLinkIngredient === true) {
      console.log("Checking inventory for linked ingredient...");
  
      // Calculate total required quantity including current receipt item quantity
      const existingReceiptItem = selectedItems.value.find(
        (item) => item.product?.productId === product.productId
      );
      const currentQuantityInReceipt = existingReceiptItem ? existingReceiptItem.quantity : 0;
      const totalRequiredQuantity = currentQuantityInReceipt + parsedQuantity;
  
      // Check if adding this quantity exceeds available inventory
      const sufficientInventory = await checkInventory(
        product.productId,
        totalRequiredQuantity,
        product.storeType
      );
  
      if (!sufficientInventory) {
        Swal.fire({
          icon: "error",
          title: "สต็อกไม่เพียงพอ",
          text: "สต็อกไม่เพียงพอสำหรับการเพิ่มสินค้านี้",
        });
        return;
      }
    }
  
    let existingItem;
    if (product.haveTopping) {
      existingItem = selectedItems.value.find(
        (item) =>
          JSON.stringify(item.productTypeToppings) ===
            JSON.stringify(productTypeToppings) &&
          item.product?.productId === product.productId &&
          item.sweetnessLevel === sweetness &&
          item.productType?.productTypeName === productType.productTypeName
      );
    } else {
      existingItem = selectedItems.value.find(
        (item) => item.product?.productId === product.productId
      );
    }
  
    // Add or update the receipt item based on existing inventory and conditions
    if (existingItem) {
      // Update existing receipt item
      if (product.haveTopping) {
        if (productTypeToppings.length > 0) {
          existingItem.quantity += parsedQuantity;
          const toppingsTotal = productTypeToppings.reduce(
            (toppingAcc, toppingItem) =>
              toppingAcc +
              parseFloat(toppingItem.topping.toppingPrice.toString()) *
                parseFloat(toppingItem.quantity.toString()) *
                existingItem.quantity,
            0
          );
          const itemTotal =
            parseFloat(productType.productTypePrice.toString()) *
              existingItem.quantity +
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
      // Add a new receipt item
      if (product.haveTopping) {
        if (productTypeToppings.length > 0) {
          const toppingsTotal = productTypeToppings.reduce(
            (toppingAcc, toppingItem) =>
              toppingAcc +
              parseFloat(toppingItem.topping.toppingPrice.toString()) *
                parseFloat(toppingItem.quantity.toString()) *
                parsedQuantity,
            0
          );
          const itemTotal =
            parseFloat(productType.productTypePrice.toString()) *
              parsedQuantity +
            toppingsTotal;
          selectedItems.value.push({
            productTypeToppings,
            quantity: parsedQuantity,
            receiptSubTotal: itemTotal,
            product,
            sweetnessLevel: sweetness,
            productType: productType,
          });
        } else {
          selectedItems.value.push({
            productTypeToppings: [],
            quantity: parsedQuantity,
            receiptSubTotal:
              parseFloat(productType.productTypePrice.toString()) *
              parsedQuantity,
            product,
            sweetnessLevel: sweetness,
            productType: productType,
          });
        }
      } else {
        selectedItems.value.push({
          productTypeToppings: [],
          quantity: parsedQuantity,
          receiptSubTotal: productPrice * parsedQuantity,
          product,
          sweetnessLevel: sweetness,
          productType: productType,
        });
      }
    }
  
    console.log("Last added item:", selectedItems.value[selectedItems.value.length - 1]);
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
    if (receipt.value.receiptTotalDiscount === 0) {
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    } else {
      receipt.value.receiptNetPrice =
        receipt.value.receiptTotalPrice - receipt.value.receiptTotalDiscount;
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

  // update receipt Item for edit in receipt
  const updateReceiptItem = (item: ReceiptItem) => {
    const index = selectedItems.value.findIndex(
      (item) =>
        JSON.stringify(item.productTypeToppings) ===
          JSON.stringify(item.productTypeToppings) &&
        item.product?.productId === item.product?.productId &&
        item.sweetnessLevel === item.sweetnessLevel &&
        item.productType?.productTypeName === item.productType?.productTypeName
    );
    const existingItem = selectedItems.value[index];
    const parsedQuantity = item.quantity;
    const productPrice = parseInt(item.product!.productPrice.toString(), 10);
    if (index !== -1) {
      if (item.product?.haveTopping) {
        // มี topping
        if (item.productTypeToppings.length > 0) {
          existingItem.quantity = parsedQuantity;
          const toppingsTotal = item.productTypeToppings.reduce(
            (toppingAcc, toppingItem) =>
              toppingAcc +
              parseFloat(toppingItem.topping.toppingPrice.toString()) *
                parseFloat(toppingItem.quantity.toString()) *
                existingItem.quantity,
            0
          );
          const itemTotal =
            parseFloat(item.productType!.productTypePrice!.toString()) *
              existingItem.quantity +
            toppingsTotal;
          existingItem.receiptSubTotal = itemTotal;
        } else {
          // ไม่มี topping

          existingItem.receiptSubTotal +=
            parseFloat(item.productType!.productTypePrice.toString()) *
            parsedQuantity;
          existingItem.quantity = parsedQuantity;
        }
      } else {
        existingItem.receiptSubTotal += productPrice * parsedQuantity;
        existingItem.quantity = parsedQuantity;
      }
    }
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
    if (receipt.value.receiptTotalDiscount === 0) {
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    } else {
      receipt.value.receiptNetPrice =
        receipt.value.receiptTotalPrice - receipt.value.receiptTotalDiscount;
    }

  };

  const calculateTotal = (selectedItems: ReceiptItem[]) => {
    receipt.value.receiptTotalPrice = 0;
    return selectedItems.reduce((acc, item) => {
      return acc + parseFloat(item.receiptSubTotal.toString());
    }, 0);
  };

  const removeItem = (index: number) => {
    selectedItems.value.splice(index, 1);
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
    if (receipt.value.receiptTotalDiscount === 0) {
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    } else {
      receipt.value.receiptNetPrice =
        receipt.value.receiptTotalPrice - receipt.value.receiptTotalDiscount;
    }
    if (selectedItems.value.length === 0) {
      receipt.value.receiptTotalPrice = 0;
      receipt.value.receiptTotalDiscount = 0;
      receipt.value.receiptNetPrice = 0;
      receipt.value.receiptItems = [];
      receipt.value.receiptPromotions = [];
      receipt.value.receiptStatus = "";
      receipt.value.paymentMethod = "";
    }
  };

  const spliceData = (index: number) => {
    selectedItems.value[index].receiptSubTotal -= parseInt(
      selectedItems.value[index].receiptSubTotal /
        selectedItems.value[index].quantity +
        ""
    );
    selectedItems.value[index].quantity -= 1;

    if (selectedItems.value[index].quantity === 0) {
      selectedItems.value.splice(index, 1);
    }
    receipt.value.receiptTotalPrice = calculateTotal(selectedItems.value);
    if (receipt.value.receiptTotalDiscount === 0) {
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    } else {
      receipt.value.receiptNetPrice =
        receipt.value.receiptTotalPrice - receipt.value.receiptTotalDiscount;
    }
    if (selectedItems.value.length === 0) {
      // clear all data
      receipt.value.receiptTotalPrice = 0;
      receipt.value.receiptTotalDiscount = 0;
      receipt.value.receiptNetPrice = 0;
      receipt.value.receiptItems = [];
      receipt.value.receiptPromotions = [];
      receipt.value.receiptStatus = "";
      receipt.value.paymentMethod = "";
    }
  };

  // create function create recipt
  const createReceipt = async (receiptStatus: string) => {
    if (currentReceipt.value?.queueNumber !== undefined) {
      receipt.value.receiptItems = selectedItems.value;
      receipt.value.receiptStatus = receiptStatus;
      receipt.value.receiptStatus = "paid";
      receipt.value.createdDate = new Date();
      receipt.value.queueNumber = queueNumber.value;
    } else {
      receipt.value.receiptItems = selectedItems.value;
      receipt.value.receiptType = receiptStatus;
      receipt.value.receiptStatus = "paid";
      receipt.value.createdDate = new Date();
      receipt.value.queueNumber = queueNumber.value;
    }

    queueNumber.value++;
    saveQueueNumber();

    if (receipt.value.receiptTotalDiscount === 0) {
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    }

    const res = await receiptService.createReceipt(receipt.value);
    if (res.status === 201) {
      console.log("Receipt created successfully", res.data);
      currentReceipt.value = res.data;
      queueReceipt.value.push(currentReceipt.value!);
      saveQueueListToLocalStorage();
      await customerStore.getAllCustomers();
    }

    await receiptStore.getRecieptIn30Min(receiptStatus);
  };

  // Function to save the queue list to local storage
  const saveQueueListToLocalStorage = () => {
    localStorage.setItem("queueReceipt", JSON.stringify(queueReceipt.value));
  };

  const createReceiptForCatering = async (checkStockId?: number) => {
    const receiptStatus = "ร้านจัดเลี้ยง";
    if (currentReceipt.value?.queueNumber !== undefined) {
      receipt.value.receiptItems = selectedItems.value;
      receipt.value.receiptStatus = receiptStatus;
      if (receipt.value.receive > 0) {
        receipt.value.receiptStatus = "paid";
      } else {
        receipt.value.receiptStatus = "unpaid";
        receipt.value.change = 0;
      }
      receipt.value.createdDate = new Date();
      receipt.value.queueNumber = currentReceipt.value?.queueNumber + 1;
    } else {
      receipt.value.receiptItems = selectedItems.value;
      receipt.value.receiptType = receiptStatus;
      if (receipt.value.receive > 0) {
        receipt.value.receiptStatus = "paid";
      } else {
        receipt.value.receiptStatus = "unpaid";
        receipt.value.change = 0;
      }
      receipt.value.createdDate = new Date();
      receipt.value.queueNumber = queueNumber.value;
    }
    queueNumber.value++;
    saveQueueNumber();
    if (receipt.value.receive != 0) {
      receipt.value.receiptNetPrice = receipt.value.receiptTotalPrice;
    }

    const res = await receiptService.createReceipt(receipt.value, checkStockId);
    if (res.status === 201) {
      console.log("Receipt created successfully", res.data);
      currentReceipt.value = res.data;
      queueReceipt.value.push(currentReceipt.value!);
      saveQueueListToLocalStorage();
      await customerStore.getAllCustomers();
    }
    await receiptStore.getRecieptCateringIn24Hours();
  };

  const applyPromotion = (promotion: Promotion) => {
    const currentDate = new Date();

    // Check if the promotion is within the valid date range
    if (currentDate < new Date(promotion.startDate)) {
      console.log("currentDate", currentDate);
      Swal.fire({
        icon: "error",
        title: "โปรโมชั่นหมดอายุ",
        text: "โปรโมชั่นไม่สามารถใช้งานได้ในขณะนี้",
      });
      return;
    }
    if (!promotion.noEndDate && currentDate > new Date(promotion.endDate!)) {
      console.log("currentDate2", currentDate);

      Swal.fire({
        icon: "error",
        title: "โปรโมชั่นหมดอายุ",
        text: "โปรโมชั่นไม่สามารถใช้งานได้ในขณะนี้",
      });
      return;
    }

    // Initial validation: check if receipt total price is valid
    if (receipt.value.receiptTotalPrice <= 0) {
      Swal.fire({
        icon: "error",
        title: "การดำเนินการไม่ถูกต้อง",
        text: "ยอดรวมต้องมากกว่าศูนย์เพื่อใช้โปรโมชั่น",
      });
      return;
    }

    let newDiscount = 0;

    if (
      promotion.promotionType === "discountPrice" ||
      promotion.promotionType === "usePoints"
    ) {
      if (promotion.promotionType === "usePoints") {
        if (receipt.value.customer !== null) {
          if (
            receipt.value.customer!.customerNumberOfStamp <
            promotion.conditionQuantity!
          ) {
            Swal.fire({
              icon: "error",
              title: "ส่วนลดไม่ถูกต้อง",
              text: "ลูกค้ามีคะแนนไม่เพียงพอที่จะแลก",
            });
            return;
          }

          receipt.value.customer!.customerNumberOfStamp -=
            promotion.conditionQuantity!;
        } else {
          Swal.fire({
            icon: "error",
            title: "ส่วนลดไม่ถูกต้อง",
            text: "ลูกค้ามีคะแนนไม่เพียงพอที่จะแลก",
          });
          return;
        }
        if (receipt.value.receiptNetPrice > 0) {
          if (receipt.value.receiptNetPrice >= promotion.discountValue!) {
            newDiscount = promotion.discountValue;
            applyDiscount(promotion, newDiscount);
          } else {
            applyDiscount(promotion, receipt.value.receiptNetPrice);
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "ส่วนลดไม่ถูกต้อง",
            text: "ยอดรวมต้องมากกว่าหรือเท่ากับ 0",
          });
          return;
        }
      }

      if (promotion.promotionType === "discountPrice") {
        countingPromotion.value += 1;
        if (countingPromotion.value > 3) {
          Swal.fire({
            icon: "warning",
            title: "คุณได้ใช้โปรโมชั่นนี้มากกว่า 3 ครั้ง",
            text: "ต้องการลดเพิ่มหรือไม่",
            showCancelButton: true,
            confirmButtonText: "ใช่",
            cancelButtonText: "ไม่ใช่",
          }).then((result) => {
            if (result.isConfirmed) {
              newDiscount = promotion.discountValue!;
              applyDiscount(promotion, newDiscount);
            } else {
              countingPromotion.value -= 1; // Revert the count if not confirmed
            }
          });
        } else {
          newDiscount = promotion.discountValue!;
          applyDiscount(promotion, newDiscount);
        }
      }
    }

    if (promotion.promotionType === "discountPercentage") {
      if (promotion.conditionValue1! <= receipt.value.receiptTotalPrice) {
        newDiscount =
          parseFloat(receipt.value.receiptTotalPrice + "") *
          (parseFloat(promotion.discountValue! + "") / 100);
        applyDiscount(promotion, newDiscount);
      } else {
        Swal.fire({
          icon: "error",
          title: "ส่วนลดไม่ถูกต้อง",
          text: "ยอดรวมต้องมากกว่าหรือเท่ากับเงื่อนไขการใช้โปรโมชั่น",
        });
        return;
      }
    }

    if (promotion.promotionType === "buy1get1") {
      const product = selectedItems.value.find(
        (item) => item.product?.productId === promotion.buyProductId
      );
      const product2 = selectedItems.value.find(
        (item) => item.product?.productId === promotion.freeProductId
      );
      console.log("product", product);
      console.log("product2", product2);

      if (product2 && product) {
        if (promotion.freeProductId === promotion.buyProductId) {
          const numberOfUsedPromotions = receipt.value.receiptPromotions.filter(
            (item) => item.promotion.promotionId === promotion.promotionId
          ).length;
          if (
            product.quantity - numberOfUsedPromotions * 2 >= 2 ||
            (product2 && product)
          ) {
            if (product.quantity >= 2) {
              newDiscount =
                parseInt(product.product?.productPrice! + "") +
                parseInt(product.productType?.productTypePrice! + "");
              console.log("newDiscount", newDiscount);

              applyDiscount(promotion, newDiscount);
            } else {
              Swal.fire({
                icon: "error",
                title: "จำนวนสินค้าไม่เพียงพอ",
                text: "จำนวนสินค้าซื้อไม่เพียงพอที่จะใช้โปรโมชั่น",
              });
              return;
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "ส่วนลดไม่ถูกต้อง",
              text: "โปรโมชั่นไม่สามารถใช้ได้สำหรับสินค้านี้",
            });
            return;
          }
        } else {
          if (product && product2) {
            if (product.quantity >= promotion.conditionValue1!) {
              if (product2.quantity >= promotion.conditionValue2!) {
                const numberOfUsedPromotions =
                  receipt.value.receiptPromotions.filter(
                    (item) =>
                      item.promotion.promotionId === promotion.promotionId
                  ).length;
                if (numberOfUsedPromotions < product.quantity) {
                  newDiscount = productStore.products.find(
                    (prod) => prod.productId === promotion.freeProductId
                  )?.productPrice!;
                  applyDiscount(promotion, newDiscount);
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "ส่วนลดไม่ถูกต้อง",
                    text: "โปรโมชั่นไม่สามารถใช้ได้สำหรับสินค้านี้",
                  });
                  return;
                }
              } else {
                Swal.fire({
                  icon: "error",
                  title: "ส่วนลดไม่ถูกต้อง",
                  text: "จำนวนสินค้าฟรีไม่เพียงพอที่จะใช้โปรโมชั่น",
                });
                return;
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "จำนวนสินค้าไม่เพียงพอ",
                text: "จำนวนสินค้าซื้อไม่เพียงพอที่จะใช้โปรโมชั่น",
              });
              return;
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "ส่วนลดไม่ถูกต้อง",
              text: "โปรโมชั่นไม่สามารถใช้ได้สำหรับสินค้านี้",
            });
            return;
          }
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "ไม่พบสินค้าในรายการ",
          text: "โปรโมชั่นไม่สามารถใช้ได้สำหรับสินค้านี้",
        });
        return;
      }
    }

    function applyDiscount(promotion: Promotion, newDiscount: number) {
      // Check if the new discount would result in a negative or zero net price
      const newTotalDiscount =
        parseFloat(receipt.value.receiptTotalDiscount + "") +
        parseFloat(newDiscount + "");
      const newNetPrice =
        parseFloat(receipt.value.receiptTotalPrice + "") -
        parseFloat(newTotalDiscount + "");

      if (newNetPrice < 0) {
        Swal.fire({
          icon: "error",
          title: "ส่วนลดไม่ถูกต้อง",
          text: "ส่วนลดมากเกินไปและจะทำให้ยอดรวมเป็นศูนย์หรือค่าติดลบ",
        });
        return;
      }

      // Apply the new discount and update the net price
      receipt.value.receiptTotalDiscount = newTotalDiscount;
      receipt.value.receiptNetPrice = newNetPrice;

      // Apply the promotion
      receipt.value.receiptPromotions.push({
        date: new Date(),
        discount: newDiscount,
        promotion: promotion,
      });

      // Update receipt totals
      receipt.value.receiptTotalDiscount = newTotalDiscount;
      receipt.value.receiptNetPrice = newNetPrice;
    }
  };

  // removePromotion
  const removePromotion = (promotion: Promotion) => {
    const index = receipt.value.receiptPromotions.findIndex(
      (item) => item.promotion.promotionId === promotion.promotionId
    );
    if (index !== -1) {
      console.log("Promotion removed", receipt.value.receiptPromotions);
      if (
        receipt.value.receiptPromotions[index].promotion.promotionType ===
        "usePoints"
      ) {
        receipt.value.customer!.customerNumberOfStamp +=
          promotion.conditionQuantity!;
      }
      receipt.value.receiptPromotions.splice(index, 1);
      selectedItemsUsePromotion.value = selectedItems.value;
    }
    // calculate total discount
    receipt.value.receiptTotalDiscount = receipt.value.receiptPromotions.reduce(
      (acc, item) => {
        return acc + parseInt(item.discount! + "");
      },
      0
    );
    receipt.value.receiptNetPrice =
      parseInt(receipt.value.receiptTotalPrice + "") -
      parseFloat(receipt.value.receiptTotalDiscount + "");
  };

  const updateReceipt = async (
    id: number,
    receipt: Receipt,
    storeTypre: string
  ) => {
    console.log("updateReceipt", JSON.stringify(receipt));
    const res = await receiptService.updateReceipt(id, receipt);
    if (res.status === 200) {
      // console.log("Receipt updated successfully", res.data);
      currentReceipt.value = res.data;
      await customerStore.getAllCustomers();
      if (currentReceipt.value?.receiptStatus !== "cancel") {
        updateReceiptInLocalStorage(res.data);
      await receiptStore.getRecieptIn30Min(storeTypre);

      } else {
        receiptStore.deleteReceiptFromLocalStorage(res.data.receiptId);
      await receiptStore.getRecieptIn30Min(storeTypre);

      }
      console.log("storeTypre", storeTypre);

      await receiptStore.getRecieptIn30Min(storeTypre);
    }
  };

  // ipdateReceiptCatering
  const updateReceiptCatering = async (id: number, receipt: Receipt) => {
    console.log("updateReceipt", JSON.stringify(receipt));
    if (receipt.receive != 0) {
      receipt.receiptStatus = "paid";
    }

    const res = await receiptService.updateReceipt(id, receipt);
    if (res.status === 200) {
      console.log("Receipt updated successfully", res.data);

      currentReceipt.value = res.data;
      await customerStore.getAllCustomers();
      await receiptStore.getRecieptCateringIn24Hours();
    }
  };

  const updateReceiptInLocalStorage = (updatedReceipt: Receipt) => {
    const receiptIndex = queueReceipt.value.findIndex(
      (receipt) => receipt.receiptId === updatedReceipt.receiptId
    );
    if (receiptIndex !== -1) {
      queueReceipt.value[receiptIndex] = updatedReceipt;
      saveQueueListToLocalStorage();
    }
  };

  const setReceiptForEdit = (receiptToEdit: Receipt) => {
    receipt.value = receiptToEdit;
  };

  const getCurrentReceipt = async () => {
    try {
      const receipt = localStorage.getItem("receipt");
      if (receipt) {
        currentReceipt.value = JSON.parse(receipt);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };
  function setReceiptItemForEdit(item: ReceiptItem) {
    selectedItemForEdit.value = item;
  }

  return {
    setReceiptForEdit,
    getCurrentReceipt,
    updateReceiptDialog,

    selectedItems,
    receiptPromotions,
    customerPhone,
    customerPoints,
    addToReceipt,
    removeItem,
    totalPrice,
    netPrice,
    // applyPromotion,
    toppingDialog,
    totalDiscount,
    selectedProduct,
    receipt,
    createReceipt,
    spliceData,
    applyPromotion,
    currentReceipt,
    receiptDialog,
    removePromotion,
    queueNumber,
    ReceiptDialogPos,
    updateReceipt,
    toggleNavigation,
    hideNavigation,
    selectUsePointDialog,
    selectedItemsUsePromotion,
    queueReceipt,
    loadQueueNumber,
    saveQueueListToLocalStorage,
    createReceiptForCatering,
    updateReceiptCatering,
    setReceiptItemForEdit,
    selectedItemForEdit,
    calculateTotal,
    updateReceiptItem,

  };
});
