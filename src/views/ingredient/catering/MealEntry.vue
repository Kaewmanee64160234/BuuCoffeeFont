<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useProductStore } from "@/stores/product.store"; // Updated to use Product Store
import type { Product } from "@/types/product.type";
import { useCateringStore } from "@/stores/catering.store";
import type { Meal, MealProduct } from "@/types/catering/meal.type";
import DrinkSelectionDialog from "@/components/pos/DrinkSelectionDialog.vue";
import { useToppingStore } from "@/stores/topping.store";
import type { ReceiptItem } from "@/types/receipt.type";
import CateringReciptItemDialog from "@/components/pos/CateringReciptItemDialog.vue";
import ProductCateringDialog from "@/components/pos/ProductCateringDialog.vue";

const productStore = useProductStore(); // New product store
const activePanelIndex = ref(0);
const searchQuery = ref("");
const selectedTab = ref("coffee");
const productFilters = ref<Product[]>([]); // Updated to handle products
const totalPrice = ref(0);
const type = ref("");
const cateringStore = useCateringStore();
const toppingStore = useToppingStore();
const visibleDetails = ref<number | null>(null); // Stores the index of the visible details row


// Toggle the visibility of the product details row
const toggleDetails = (index: number) => {
  if (visibleDetails.value === index) {
    visibleDetails.value = null; // Collapse if already open
  } else {
    visibleDetails.value = index; // Expand the selected row
  }
};

// Handle quantity decrease
const decreaseProductQuantity = (mealIndex:number,item: MealProduct) => {
  if (item.quantity > 1) {
    item.quantity--;
    item.totalPrice = item.product!.productPrice * item.quantity;
    console.log(item.totalPrice);
    // update in reciptItem
    cateringStore.cateringEvent.meals![mealIndex].receipt.receiptItems.forEach(
      (receiptItem: ReceiptItem) => {
        if (receiptItem.product!.productName === item.product!.productName) {
          receiptItem.quantity = item.quantity;
          receiptItem.receiptSubTotal = item.totalPrice;
        }
      }
    );
    const totalEventPrice = cateringStore.cateringEvent.meals!.reduce(
      (sum, meal) => sum + meal.totalPrice,
      0
    );
    cateringStore.cateringEvent.cashierAmount = totalEventPrice;
  }
  cateringStore.calculateTotalPrice(mealIndex)
  // Update total price for all meals in the catering event
 
};

// Handle removing the product from the meal
const removeProductFromMeal = (mealIndex: number, productIndex: number) => {
  cateringStore.cateringEvent.meals![mealIndex].mealProducts.splice(
    productIndex,
    1
  );
  cateringStore.cateringEvent.meals![mealIndex].totalPrice = cateringStore.cateringEvent.meals![mealIndex].mealProducts.reduce(
    (sum, item) => {
      return sum + item.totalPrice;
    },
    0
  );



};

// Watch for tab selection changes and update product filters accordingly
watch(selectedTab, () => {
  filterProducts();
  type.value = selectedTab.value === "coffee" ? "coffee" : "rice";
});

// Filter products based on the selected tab (coffee or rice)
async function filterProducts() {
  if (selectedTab.value === "coffee") {
    await productStore.getProductByStoreType("ร้านกาแฟ"); // Fetch coffee products
    productFilters.value = productStore.products;
  } else if (selectedTab.value === "rice") {
    await productStore.getProductByStoreType("ร้านข้าว"); // Fetch rice products
    productFilters.value = productStore.products;
  }
}

// Initialize component with coffee products and toppings
onMounted(async () => {
  await productStore.getProductByStoreType("ร้านกาแฟ"); // Fetch coffee products by default
  await toppingStore.getAllToppings();
  filterProducts();
});

// Calculate total price for all products in all meals

// setfilteredReceiptItems
const setFilteredReceiptItems = (
  mealIndex: number,
  mealProduct: MealProduct
) => {
  if (mealProduct.product!.haveTopping) {
    const receiptItems = cateringStore.cateringEvent.meals![
      mealIndex
    ].receipt.receiptItems.filter(
      (receiptItem: ReceiptItem) =>
        receiptItem.product!.productName === mealProduct.product!.productName
    );
    cateringStore.filteredReceiptItems = receiptItems;
    console.log("filteredReceiptItems", cateringStore.filteredReceiptItems);
    cateringStore.selectedMealIndex = mealIndex;

    cateringStore.cateringReceiptItemDialog = true;
  }
};



const openDrinkSelectionDialog = (indexMeals: number) => {
  cateringStore.selectedMealIndex = indexMeals;

  cateringStore.cateringProductDialog = true;
};
</script>

<template>
  <v-card class="mb-5" style="background-color: #62544a">
    <v-card-text>
      <v-expansion-panels class="mb-5">
        <v-expansion-panel
          v-for="(meal, indexMeals) in cateringStore.cateringEvent.meals"
          :key="indexMeals"
          class="mb-4"
        >
          <v-expansion-panel-header>
            <v-row class="d-flex align-center">
              <v-col class="d-flex align-center justify-space-between">
                <v-card-title>
                  รายละเอียดมื้ออาหาร #{{ indexMeals + 1 }}
                </v-card-title>
                <v-btn
                  icon
                  class="ma-3"
                  color="#F55050"
                  @click="cateringStore.removeMeal(indexMeals)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
              
            </v-row>
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  label="ชื่อมื้ออาหาร"
                  v-model="meal.mealName"
                  class="ml-4"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="เวลามื้ออาหาร"
                  v-model="meal.mealTime"
                  type="time"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="ราคารวม"
                  v-model.number="meal.totalPrice"
                  class="mr-4"
                  dense
                  hide-details
                  variant="solo"
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>
            <v-card-title>
              <v-row class="d-flex align-center">
                <v-col cols="9">
                  <h3>การเลี้ยงรับรอง - วัตถุดิบ</h3>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="ค้นหาวัตถุดิบ"
                    append-inner-icon="mdi-magnify"
                    dense
                    class="mt-3"
                    hide-details
                    variant="solo"
                    outlined
                    v-model="searchQuery"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn
                color="accent"
                @click="openDrinkSelectionDialog(indexMeals)"
                style="font-size: 17px;"
                >เพิ่มสินค้าจัดเลี้ยง</v-btn
              >
            </v-card-title>

            <v-tabs
              v-model="selectedTab"
              align-tabs="start"
              color="brown"
              background-colaor="#fff"
              class="ma-4"
            >
              <v-tab value="coffee" style="font-size: 17px;">วัตถุดิบร้านกาแฟ</v-tab>
              <v-tab value="rice" style="font-size: 17px;">วัตถุดิบร้านข้าว</v-tab>
            </v-tabs>

            <v-row class="mt-4">
              <!-- Updated to show products -->
              <v-col cols="6">
                <v-container>
                  <v-row>
                    <v-col
                      cols="3"
                      style=" white-space: nowrap;text-align: center; padding: 8px"
                      v-for="(item, index) in productFilters"
                      :key="index"
                    >
                      <v-card
                        width="120%"
                        height="100%"
                        class="pa-2"
                        @click="
                          cateringStore.addProduct(item, indexMeals, type)
                        "
                      >
                        <v-img
                          :src="`http://localhost:3000/products/${item.productId}/image`"
                          height="100"
                        ></v-img>
                        <v-card-title style="font-size: 18px">
                          {{ item.productName }}
                        </v-card-title>
                        <v-card-subtitle style="font-size: 15px">
                          ราคาต้นทุน
                          {{
                            item.haveTopping
                              ? item.productTypes![0].productTypePrice
                              : item.productPrice
                          }}
                          บาท
                        </v-card-subtitle>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
              <v-col cols="6">
                <v-card style="white-space: nowrap;height: 400px; overflow-y: auto" class="ma-5">
                  <v-table>
                    <thead>
                      <tr>
                        <th class="text-center" style="white-space: nowrap;font-size: 18px; width: 10%;">ลำดับ</th>
                        <th class="text-center" style="white-space: nowrap;font-size: 18px; width: 25%;">ชื่อสินค้า</th>
                        <th class="text-center" style="white-space: nowrap;font-size: 18px; width: 15%;">คลัง</th>
                        <th class="text-center" style="white-space: nowrap;font-size: 18px; width: 20%;">ราคารวม</th>
                        <th class="text-center" style="white-space: nowrap;font-size: 18px; width: 20%;">จำนวน</th>
                        <th class="text-center" style="white-space: nowrap;font-size: 18px; width: 10%;">แอคชั่น</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="white-space: nowrap;font-size: 18px" v-for="(item, itemIndex) in meal.mealProducts" :key="itemIndex" @click="setFilteredReceiptItems(indexMeals, item)">
                        <td class="text-center" style="white-space: nowrap;font-size: 18px">{{ itemIndex + 1 }}</td>
                        <td class="text-center" style="white-space: nowrap;font-size: 18px" @click="toggleDetails(itemIndex)">
                          {{ item.product!.productName }}
                        </td>
                        <td class="text-center" style="white-space: nowrap;font-size: 18px">{{ item.type }}</td>
                        <td class="text-center" style="white-space: nowrap;font-size: 18px">{{ item.totalPrice }}</td>
                        <td class="text-center" style="white-space: nowrap;font-size: 18px">
                          <v-row justify="center" align="center">
                            <v-col v-if="!item.product!.haveTopping" cols="4" class="text-center">
                              <v-btn icon @click.stop="decreaseProductQuantity(indexMeals, item)" size="small" class="styled-button">-</v-btn>
                            </v-col>
                            <v-col cols="4" class="text-center">
                              {{ item.quantity }}
                            </v-col>
                            <v-col v-if="!item.product!.haveTopping" cols="4" class="text-center">
                              <v-btn icon @click.stop="cateringStore.addProductToMeal(item.product!, indexMeals)" size="small" class="styled-button">+</v-btn>
                            </v-col>
                          </v-row>
                        </td>
                        <td class="text-center">
                          <v-btn icon @click.stop="removeProductFromMeal(indexMeals, itemIndex)" class="styled-button">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-col>
              
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn
        style="background-color: #ff9642"
        @click="cateringStore.addMeal()"
        class="button-full-width"
        rounded
      >
        <v-icon left></v-icon> <strong>เพิ่มมื้อการจัดเลี้ยง</strong>
      </v-btn>
    </v-card-text>
  </v-card>
  <DrinkSelectionDialog />
  <CateringReciptItemDialog />
  <ProductCateringDialog />
</template>

<style scoped>
.button-full-width {
  width: 100%;
}
</style>
