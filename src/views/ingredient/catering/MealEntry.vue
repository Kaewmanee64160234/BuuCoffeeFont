<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useProductStore } from "@/stores/product.store";
import type { Product } from "@/types/product.type";
import { useCateringStore } from "@/stores/catering.store";
import type { MealProduct } from "@/types/catering/meal.type";
import DrinkSelectionDialog from "@/components/pos/DrinkSelectionDialog.vue";
import { useToppingStore } from "@/stores/topping.store";
import type { ReceiptItem } from "@/types/receipt.type";
import CateringReciptItemDialog from "@/components/pos/CateringReciptItemDialog.vue";
import ProductCateringDialog from "@/components/pos/ProductCateringDialog.vue";
import router from "@/router";

const productStore = useProductStore();
const cateringStore = useCateringStore();
const toppingStore = useToppingStore();

const activeMealIndex = ref<number | null>(null); // Track the open meal section
const searchQuery = ref("");
const selectedTab = ref("ร้านกาแฟ"); // Default tab is coffee
const productFilters = ref<Product[]>([]);

// Toggle visibility of product details
const toggleMealDetails = (index: number) => {
  activeMealIndex.value = activeMealIndex.value === index ? null : index;
};

// Simplify quantity adjustment
const decreaseProductQuantity = (mealIndex: number, item: MealProduct) => {
  if (item.quantity > 1) {
    item.quantity--;
    if(item.product){
    item.totalPrice = parseFloat(item.product!.productPrice+'') * parseInt(item.quantity+'');
    const meal = cateringStore.cateringEvent.meals![mealIndex];
    meal.totalPrice = meal.mealProducts.reduce(
      (sum, p) => parseFloat(sum+'') + parseFloat( p.totalPrice+''),
      0
    );
    cateringStore.calculateTotalPrice(mealIndex);
    }
    else{
      item.totalPrice =parseFloat (item.productPrice!+'') * parseInt(item.quantity+'');
      const meal = cateringStore.cateringEvent.meals![mealIndex];
      meal.totalPrice = meal.mealProducts.reduce(
        (sum, p) => parseFloat(sum+'') + parseFloat( p.totalPrice+''),
        0
      );
      cateringStore.calculateTotalPrice(mealIndex);
    }

  }
};

// Fetch products based on the selected category
const fetchProductsByCategory = async () => {
  const storeType = selectedTab.value === "ร้านกาแฟ" ? "ร้านกาแฟ" : "ร้านข้าว";
  await productStore.getProductByStoreType(storeType);
  productFilters.value = productStore.products;
};

// Initialize with coffee products and toppings
onMounted(async () => {
  // get id from param
  
  await fetchProductsByCategory(); // Fetch coffee products by default
  await toppingStore.getAllToppings();
});

// Watch for changes in the selected tab (category) and update products
watch(selectedTab, async () => {
  await fetchProductsByCategory();
});

// Handle removing a product
const removeProductFromMeal = (mealIndex: number, productIndex: number) => {
  const meal = cateringStore.cateringEvent.meals![mealIndex];
  meal.mealProducts.splice(productIndex, 1);
  meal.totalPrice = meal.mealProducts.reduce((sum, p) => parseFloat(sum+'') + parseFloat(p.totalPrice+''), 0);
};

// Select items when meal product has toppings
const setFilteredReceiptItems = (
  mealIndex: number,
  mealProduct: MealProduct
) => {
  if (mealProduct.product!.haveTopping) {

    cateringStore.filteredReceiptItems = cateringStore.cateringEvent.meals![
      mealIndex
    ].coffeeReceipt!.receiptItems.filter(
      (item) => item.product?.productId === mealProduct.product!.productId
    );
    console.log("reciptItem",cateringStore.cateringEvent.meals![
      mealIndex
    ].coffeeReceipt!.receiptItems);
    
    

    cateringStore.selectedMealIndex = mealIndex;
    cateringStore.cateringReceiptItemDialog = true;
  }
};

// Toggle drink selection dialog for items with toppings
const openDrinkSelectionDialog = (indexMeals: number) => {
  cateringStore.selectedMealIndex = indexMeals;
  cateringStore.cateringProductDialog = true;
};

// Watch for changes in search query to filter products
watch(searchQuery, (query) => {
  productFilters.value = productStore.products.filter((product) =>
    product.productName.toLowerCase().includes(query.toLowerCase())
  );
});
</script>

<template>
  <v-card>
    <v-card-text>
      <!-- Iterate over each meal and show all details -->
      <div
        v-for="(meal, indexMeals) in cateringStore.cateringEvent.meals"
        :key="indexMeals"
      >
        <v-row class="d-flex align-center mb-3">
          <v-col class="d-flex align-center justify-space-between">
            <v-card-title
              >รายละเอียดมื้ออาหาร #{{ indexMeals + 1 }}</v-card-title
            >
            <v-btn
              icon
              color="#F55050"
              @click="cateringStore.removeMeal(indexMeals)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Meal details without toggle -->
        <v-row>
          <v-col cols="4">
            <v-text-field
              v-model="meal.mealName"
              label="ชื่อมื้ออาหาร"
              dense
              hide-details
              variant="solo"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="meal.mealTime"
              label="เวลามื้ออาหาร"
              type="time"
              dense
              hide-details
              variant="solo"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model.number="meal.totalPrice"
              label="ราคารวม"
              dense
              hide-details
              variant="solo"
              disabled
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Description Field -->
        <v-text-field
          v-model="meal.description"
          label="รายละเอียด"
          dense
          hide-details
          variant="solo"
          class="ma-4"
        ></v-text-field>

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
            style="font-size: 17px"
          >
            เพิ่มสินค้าจัดเลี้ยง
          </v-btn>
        </v-card-title>

        <v-tabs
          align-tabs="start"
          color="brown"
          background-color="#fff"
          class="ma-4"
        >
          <v-tab @click="selectedTab = 'ร้านกาแฟ'">วัตถุดิบร้านกาแฟ</v-tab>
          <v-tab @click="selectedTab = 'ร้านข้าว'">วัตถุดิบร้านข้าว</v-tab>
        </v-tabs>

        <v-row class="mt-4">
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
                    width="120%"
                    class="pa-2"
                    @click="
                      cateringStore.addProduct(item, indexMeals, item.storeType)
                    "
                  >
                    <v-img
                      :src="`http://localhost:3000/products/${item.productId}/image`"
                      height="100"
                    ></v-img>
                    <v-card-title>{{ item.productName }}</v-card-title>
                    <v-card-subtitle>
                      ราคาต้นทุน
                      {{
                        item.haveTopping && item.productTypes![0]
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

          <!-- Meal Products Table -->
          <v-col cols="6">
            <v-card style="height: 400px; overflow-y: auto" class="ma-5">
              <v-table>
                <thead>
                  <tr>
                    <th class="text-center">ลำดับ</th>
                    <th class="text-center">ชื่อสินค้า</th>
                    <th class="text-center">ร้าน</th>
                    <th class="text-center">ราคา/ชิ้น</th>
                    <th class="text-center">ราคารวม</th>
                    <th class="text-center">หน่วย</th>
                    <th class="text-center">จำนวน</th>
                    <th class="text-center">แอคชั่น</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, itemIndex) in meal.mealProducts"
                    :key="itemIndex"
                    @click="setFilteredReceiptItems(indexMeals, item)"
                  >
                    <td class="text-center">{{ itemIndex + 1 }}</td>
                    <td class="text-center">
                      {{
                        item.product
                          ? item.product.productName
                          : item.productName
                      }}
                    </td>


                    <td class="text-center">
                      {{
                        item.product
                          ? item.product.storeType
                          : item.type
                      }}
                    </td>
                    <td v-if="item.product">
                      <p
                        v-if="item.product!.haveTopping && item.type != 'เลี้ยงรับรอง'"
                      >
                        {{ item.product.productTypes![0].productTypePrice }}
                      </p>
                      <p
                        v-else-if="!item.product!.haveTopping && item.type != 'เลี้ยงรับรอง'"
                      >
                        {{ item.product?.productPrice }}
                      </p>
                   
                    </td>
                    <td  v-else >
                      {{ item.productPrice }}
                    </td>


                    <td>{{ item.totalPrice }}</td>
                    <td>
                      {{
                        item.product?.haveTopping
                          ? "ชิ้น"
                          : item.product?.ingredient
                              ?.ingredientQuantityPerSubUnit || "ชิ้น"
                      }}
                    </td>
                    <td>
                      <!-- button nincreate and decreat -->
                      <v-btn
                        v-if="!item.product?.haveTopping"
                        icon
                        @click.stop="decreaseProductQuantity(indexMeals, item)"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>

                      {{ item.quantity }}
                      <!-- increate -->
                      <v-btn
                        icon
                        v-if="!item.product?.haveTopping"
                        @click.stop="
                          item.product &&
                            cateringStore.addProduct(
                              item.product,
                              indexMeals,
                              item.product.storeType
                            )
                        "
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </td>
                    <td>
                      <v-btn
                        icon
                        @click.stop="
                          removeProductFromMeal(indexMeals, itemIndex)
                        "
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card-text>

    <v-card class="mb-5" style="background-color: #62544a">
      <!-- Add Meal Button -->
      <v-card-text>
        <v-btn
          color="primary"
          class="mt-4 button-full-width"
          @click="cateringStore.addMeal()"
          rounded
        >
          <v-icon left>mdi-plus</v-icon>
          <strong>เพิ่มมื้ออาหาร</strong>
        </v-btn>
      </v-card-text>
    </v-card>

    <DrinkSelectionDialog />
    <CateringReciptItemDialog />
    <ProductCateringDialog />
  </v-card>
</template>

<style scoped>
.button-full-width {
  width: 100%;
}
</style>
