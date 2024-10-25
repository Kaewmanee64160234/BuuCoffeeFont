<script setup lang="ts">
import { useCateringStore } from "@/stores/catering.store";
import type { ReceiptItem } from "@/types/receipt.type";
import { ref } from "vue";

const cateringStore = useCateringStore();




const increaseQuantity = (item: ReceiptItem) => {
  item.quantity++;
  item.receiptSubTotal = cateringStore.calculateSubtotal(item);

  cateringStore.syncMealProduct();
  cateringStore.updateTotalPrice();
};

const decreaseQuantity = (item: ReceiptItem, index: number) => {
  if (item.quantity > 1) {
    item.quantity--;
    item.receiptSubTotal = cateringStore.calculateSubtotal(item);
  } else {
    removeItem(index);
  }

  cateringStore.syncMealProduct();
  cateringStore.updateTotalPrice();
};

const removeItem = (index: number) => {
  const item = cateringStore.filteredReceiptItems[index];
  cateringStore.filteredReceiptItems.splice(index, 1);

  const selectedMeal =
    cateringStore.cateringEvent.meals![cateringStore.selectedMealIndex];

  const receiptIndex = selectedMeal.receipt.receiptItems.findIndex(
    (receiptItem) =>
      receiptItem.product?.productId === item.product!.productId &&
      receiptItem === item
  );
  if (receiptIndex !== -1) {
    selectedMeal.receipt.receiptItems.splice(receiptIndex, 1);
  }

  const remainingItemsForProduct = selectedMeal.receipt.receiptItems.filter(
    (receiptItem) => receiptItem.product?.productId === item.product!.productId
  );

  if (remainingItemsForProduct.length === 0) {
    const mealProductIndex = selectedMeal.mealProducts.findIndex(
      (mealProduct) =>
        mealProduct.product!.productId === item.product!.productId
    );
    if (mealProductIndex !== -1) {
      selectedMeal.mealProducts.splice(mealProductIndex, 1);
    }
    if (selectedMeal.receipt.receiptItems.length === 0) {
      cateringStore.cateringReceiptItemDialog = false;
    }
  }

  if (selectedMeal.receipt.receiptItems.length === 0) {
    selectedMeal.totalPrice = 0;
    selectedMeal.mealProducts = [];
  } else {
    selectedMeal.totalPrice = selectedMeal.receipt.receiptItems.reduce(
      (total, receiptItem) => {
        return total + receiptItem.receiptSubTotal;
      },
      0
    );
  }

  cateringStore.syncMealProduct();
  cateringStore.updateTotalPrice();
};
</script>

<template>
  <v-dialog
    v-model="cateringStore.cateringReceiptItemDialog"
    scrollable
    fullscreen
    persistent
    :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  >
    <v-card>
      {{
        cateringStore.cateringEvent.meals![
          cateringStore.selectedMealIndex
        ].receipt.receiptItems.filter(
          (item) => item.product?.productId === item.product?.productId
        ).length
      }}
      <v-card-title> รายการสินค้าที่เลือก </v-card-title>
      <v-card-text>
        <div class="selected-items-list">
          <v-list>
            <v-list-item-group>
              <div
                v-for="(item, index) in cateringStore.filteredReceiptItems"
                :key="index"
                class="selected-item"
              >
                <v-list-item>
                  <v-row no-gutters>
                    <v-col cols="6" class="product-name">
                      {{ item.product?.productName }}
                    </v-col>
                    <v-col cols="6" class="text-right product-price">
                      <p>{{ item.receiptSubTotal }}.-</p>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="7">
                      <div
                        v-if="item.product?.haveTopping"
                        class="product-details"
                      >
                        {{ item.productType?.productTypeName }} +{{
                          item.productType?.productTypePrice
                        }}
                        | ความหวาน {{ item.sweetnessLevel }}%
                      </div>
                      <ul
                        v-if="item.productTypeToppings?.length"
                        class="toppings-list"
                      >
                        <li
                          v-for="topping in item.productTypeToppings"
                          :key="topping?.topping?.toppingId"
                          class="topping-item"
                        >
                          x{{ topping?.quantity }}
                          {{ topping?.topping?.toppingName }}
                          <span v-if="topping?.topping?.toppingPrice"
                            >: {{ topping?.topping?.toppingPrice }}.-</span
                          >
                        </li>
                      </ul>
                    </v-col>

                    <v-col cols="5" class="quantity-controls">
                      <v-btn
                        size="xs-small"
                        color="#C5C5C5"
                        icon
                        @click.stop="decreaseQuantity(item, index)"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                      <span class="quantity">{{ item.quantity }}</span>
                      <v-btn
                        size="xs-small"
                        color="#FF9642"
                        icon
                        @click.stop="increaseQuantity(item)"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        @click.stop="removeItem(index)"
                      >
                        <v-icon color="red">mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-list-item>
              </div>
            </v-list-item-group>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          @click="cateringStore.cateringReceiptItemDialog = false"
          >ปิด</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.selected-items-list {
  padding: 16px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-details {
  font-size: 12px;
  color: #777;
}

.toppings-list {
  margin: 0;
  padding-left: 16px;
  list-style: none;
}

.topping-item {
  font-size: 12px;
  color: #555;
}

.text-right {
  text-align: right;
}
</style>
