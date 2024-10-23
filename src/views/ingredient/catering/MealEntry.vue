<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useProductStore } from "@/stores/product.store"; // Updated to use Product Store
import type { Product } from "@/types/product.type";
import { useCateringStore } from "@/stores/catering.store";
import type { MealProduct } from "@/types/catering/meal.type";
import DrinkSelectionDialog from "@/components/pos/DrinkSelectionDialog.vue";
import { useToppingStore } from "@/stores/topping.store";
import type { ReceiptItem } from "@/types/receipt.type";

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

// Check if the details for a specific row are visible
const isDetailsVisible = (index: number) => {
  return visibleDetails.value === index;
};

// Handle quantity increase
const increaseProductQuantity = (item: any) => {
  item.quantity++;
  item.totalPrice = item.product.productPrice * item.quantity;
};

// Handle quantity decrease
const decreaseProductQuantity = (item: any) => {
  if (item.quantity > 1) {
    item.quantity--;
    item.totalPrice = item.product.productPrice * item.quantity;
  }
};

// Handle removing the product from the meal
const removeProductFromMeal = (mealIndex: number, productIndex: number) => {
  cateringStore.cateringEvent.meals![mealIndex].mealProducts.splice(productIndex, 1);
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
  calculateTotalPrice();
});

// Calculate total price for all products in all meals
const calculateTotalPrice = () => {
  totalPrice.value = cateringStore.cateringEvent.meals!.reduce((sum, meal) => {
    return (
      sum +
      meal.mealProducts.reduce((productSum, item) => {
        return productSum + (item.totalPrice! * item.quantity || 0);
      }, 0)
    );
  }, 0);
};

// Watch for changes in the meal products and recalculate the total price
watch(
  () => cateringStore.cateringEvent.meals,
  () => {
    calculateTotalPrice();
  },
  { deep: true }
);
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
              <v-col class="d-flex align-center">
                <v-card-title>
                  รายละเอียดมื้ออาหาร #{{ indexMeals + 1 }}
                </v-card-title>
                <v-btn
                  icon
                  class="ml-2"
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
                  label="Meal Name"
                  v-model="meal.mealName"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Meal Time"
                  v-model="meal.mealTime"
                  type="time"
                  dense
                  hide-details
                  variant="solo"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Total Price"
                  v-model.number="meal.totalPrice"
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
                    hide-details
                    variant="solo"
                    outlined
                    v-model="searchQuery"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-title>

            <v-tabs
              v-model="selectedTab"
              align-tabs="start"
              color="brown"
              background-color="#fff"
            >
              <v-tab value="coffee">วัตถุดิบร้านกาแฟ</v-tab>
              <v-tab value="rice">วัตถุดิบร้านข้าว</v-tab>
            </v-tabs>

            <v-row class="mt-4">
              <!-- Updated to show products -->
              <v-col cols="6">
                <v-container>
                  <v-row>
                    <v-col
                      cols="3"
                      style="text-align: center; padding: 8px"
                      v-for="(item, index) in productFilters"
                      :key="index"
                    >
                      <v-card
                        width="100%"
                        @click="
                          cateringStore.addProduct(item, indexMeals, type)
                        "
                      >
                        <v-img
                          :src="`http://localhost:3000/products/${item.productId}/image`"
                          height="100"
                        ></v-img>
                        <v-card-title style="font-size: 14px">
                          {{ item.productName }}
                        </v-card-title>
                        <v-card-subtitle style="font-size: 12px">
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
                <v-card style="height: 400px; overflow-y: auto">
                  <v-table>
                    <thead>
                      <tr>
                        <th class="text-center">ลำดับ</th>
                        <th class="text-center">ชื่อสินค้า</th>
                        <th class="text-center">คลัง</th>
                        <th class="text-center">ราคารวม</th>
                        <th class="text-center">จำนวน</th>
                        <th class="text-center">แอคชั่น</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, itemIndex) in meal.mealProducts"
                        :key="itemIndex"
                      >
                    
                        <td>{{ itemIndex + 1 }}</td>
                        <td @click="toggleDetails(itemIndex)">
                          {{ item.product.productName }}
                        </td>
                        <!-- Clicking toggles details -->
                        <td>{{ item.type }}</td>
                        <td>{{ item.totalPrice }}</td>
                        <td>
                          <v-row justify="center" align="center">
                            <v-col cols="4" class="text-center">
                              <v-btn
                                icon
                                @click.stop="decreaseProductQuantity(item)"
                                size="small"
                                class="styled-button"
                              >
                                -
                              </v-btn>
                            </v-col>
                            <v-col cols="4" class="text-center">
                              {{ item.quantity }}
                            </v-col>
                            <v-col cols="4" class="text-center">
                              <v-btn
                                icon
                                @click.stop="increaseProductQuantity(item)"
                                size="small"
                                class="styled-button"
                              >
                                +
                              </v-btn>
                            </v-col>
                          </v-row>
                        </td>
                        <td>
                          <v-btn
                            icon
                            @click.stop="
                              removeProductFromMeal(indexMeals, itemIndex)
                            "
                            class="styled-button"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </td>
                        <v-row> 
                          <br>
                          
                          <!-- Expandable row for showing product details -->
                           <v-row v-if="item.product.haveTopping" >
                             <v-row v-for="(itemReciept,indexItemReceipt) in meal.receipt.receiptItems.filter(
                               (receiptItem:ReceiptItem) => receiptItem.product!.productId === item.product.productId
                             )" :key="indexItemReceipt" >
                             <v-col>{{ itemReciept.product?.productName }}</v-col>
                             <v-col>{{ itemReciept.quantity }}</v-col>
                             <v-col>{{ itemReciept.productType?.productTypeName }}</v-col>
 
                             </v-row>
 
                           </v-row>
                     
                       </v-row>
                    
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
</template>

<style scoped>
.button-full-width {
  width: 100%;
}
</style>
