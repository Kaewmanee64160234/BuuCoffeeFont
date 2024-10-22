<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useProductStore } from "@/stores/product.store"; // Updated to use Product Store
import type { Product } from "@/types/product.type";
import { useCateringStore } from "@/stores/catering.store";
import type { MealProduct } from "@/types/catering/meal.type";
const productStore = useProductStore(); // New product store
const activePanelIndex = ref(0);
const searchQuery = ref("");
const selectedTab = ref("coffee");
const productFilters = ref<Product[]>([]); // Updated to handle products
const totalPrice = ref(0);
const type = ref("");
const cateringStore = useCateringStore();

const removeProductFromMeal = (index: number, itemIndex: number) => {
  const mealIndex = activePanelIndex.value;
  cateringStore.meals[mealIndex].mealProducts.splice(index, 1); // Adjusted for product
  calculateTotalPrice();
};

const addProductToMeal = (item: Product) => {
  const mealIndex = cateringStore.meals.length - 1;
  const existingProduct = cateringStore.meals[mealIndex].mealProducts.find(
    (product) => product.product.productId === item.productId
  );

  let count = 1;

  if (existingProduct) {
    count = existingProduct.quantity + 1;
    existingProduct.quantity = count;
    if (item.haveTopping) {
      existingProduct.totalPrice =
        item.productTypes![0].productTypePrice * count;
    } else {
      existingProduct.totalPrice = item.productPrice * count;
    }
  } else {
    if (item.haveTopping) {
      cateringStore.meals[mealIndex].mealProducts.push({
        mealId: mealIndex,
        product: { ...item },
        quantity: count,
        totalPrice: item.productTypes![0].productTypePrice * count,
        type: type.value,
      });
    } else {
      cateringStore.meals[mealIndex].mealProducts.push({
        mealId: mealIndex,
        product: { ...item },
        quantity: count,
        totalPrice: item.productPrice * count,
        type: type.value,
      });
    }
  }

  const total = cateringStore.meals[mealIndex].mealProducts.reduce(
    (sum, product) => {
      return sum + product.totalPrice;
    },
    0
  );

  cateringStore.meals[mealIndex].totalPrice = total;
};
// incress number of product quantity
const increaseProductQuantity = (item: MealProduct) => {
  item.quantity++;
  if (item.product.haveTopping) {
    item.totalPrice =
      item.product.productTypes![0].productTypePrice * item.quantity;
  } else {
    item.totalPrice = item.product.productPrice * item.quantity;
  }
  calculateTotalPrice();
};
// decress number of product quantity
const decreaseProductQuantity = (item: MealProduct) => {
  if (item.quantity > 1) {
    item.quantity--;
    if (item.product.haveTopping) {
      item.totalPrice =
        item.product.productTypes![0].productTypePrice * item.quantity;
    } else {
      item.totalPrice = item.product.productPrice * item.quantity;
    }
    calculateTotalPrice();
  }
};
watch(selectedTab, () => {
  filterProducts();
  type.value = selectedTab.value === "coffee" ? "coffee" : "rice";
});

async function filterProducts() {
  console.log("selectedTab.value", selectedTab.value);

  if (selectedTab.value === "coffee") {
    await productStore.getProductByStoreType("ร้านกาแฟ"); // Fetch coffee products
    productFilters.value = productStore.products;
    type.value = "coffee";
  } else if (selectedTab.value === "rice") {
    await productStore.getProductByStoreType("ร้านข้าว"); // Fetch rice products
    productFilters.value = productStore.products;
    type.value = "rice";
  }
}

onMounted(async () => {
  await productStore.getProductByStoreType("ร้านกาแฟ"); // Fetch coffee products
  filterProducts();
  calculateTotalPrice();
});

const calculateTotalPrice = () => {
  totalPrice.value = cateringStore.mealProducts.reduce((sum, item) => {
    return sum + (item.totalPrice! * item.quantity || 0);
  }, 0);
};

watch(
  () => cateringStore.mealProducts,
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
          v-for="(meal, index) in cateringStore.meals"
          :key="index"
          class="mb-4"
        >
          <v-expansion-panel-header>
            <v-row class="d-flex align-center">
              <v-col class="d-flex align-center">
                <v-card-title
                  >รายละเอียดมื้ออาหาร #{{ index + 1 }}</v-card-title
                >
                <v-btn
                  icon
                  class="ml-2"
                  @click="cateringStore.removeMeal(index)"
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
                >
                </v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Total Price"
                  v-model.number="meal.totalPrice"
                  dense
                  hide-details
                  variant="solo"
                  disabled
                >
                </v-text-field>
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
                  >
                  </v-text-field>
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
                      <v-card width="100%" @click="addProductToMeal(item)">
                        <v-img
                          :src="`http://localhost:3000/products/${item.productId}/image`"
                          height="100"
                        >
                        </v-img>
                        <v-card-title style="font-size: 14px">{{
                          item.productName
                        }}</v-card-title>
                        <!-- <v-card-subtitle style="font-size: 12px">{{ item.productSupplier }}</v-card-subtitle> -->
                        <v-card-subtitle style="font-size: 12px"
                          >ราคาต้นทุน
                          {{
                            item.haveTopping
                              ? item.productTypes![0].productTypePrice
                              : item.productPrice
                          }}
                          บาท</v-card-subtitle
                        >
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
                        <th class="text-center" >ลำดับ</th>
                        <th class="text-center" >ชื่อสินค้า</th>
                        <th class="text-center" >คลัง</th>
                        <th class="text-center" >ราคารวม</th>
                        <th class="text-center" >จำนวน</th>
                        <th class="text-center" >แอคชั่น</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, itemIndex) in meal.mealProducts"
                        :key="itemIndex"
                      >
                        <td>{{ itemIndex + 1 }}</td>
                        <td>{{ item.product.productName }}</td>
                        <td>{{ item.type }}</td>
                        <td>{{ item.totalPrice }}</td>
                        <td>
                          <!-- add button increaes and decesss -->

                          <!-- add button increases and decreases -->
                          <v-row justify="center" align="center">
                            <v-col cols="4" class="text-center">
                              <v-btn
                                icon
                                @click="decreaseProductQuantity(item)"
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
                                @click="increaseProductQuantity(item)"
                                size="small"
                                class="styled-button"
                              >
                                +
                              </v-btn>
                            </v-col>
                          </v-row>
                        </td>
                        <td>
                          <button
                            @click="removeProductFromMeal(index, itemIndex)"
                            class="styled-button"
                          >
                            ลบ
                          </button>
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
        @click="cateringStore.addMeal"
        class="button-full-width"
        rounded
      >
        <v-icon left></v-icon> <strong>เพิ่มมื้อการจัดเลี้ยง</strong>
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.button-full-width {
  width: 100%;
}
</style>
