<script setup lang="ts">
import { useCateringStore } from '@/stores/catering.store';
import type { ReceiptItem } from '@/types/receipt.type';
import { ref } from 'vue';

const cateringStore = useCateringStore();

// Calculate the subtotal for an item based on quantity and toppings
const calculateSubtotal = (item: ReceiptItem) => {
  let subtotal = item.productType?.productTypePrice! * item.quantity;

  // If the product has toppings, add topping prices to the subtotal
  if (item.product?.haveTopping && item.productTypeToppings) {
    const toppingsTotal = item.productTypeToppings.reduce((total, topping) => {
      return total + topping.topping.toppingPrice * topping.quantity;
    }, 0);
    subtotal += toppingsTotal * item.quantity;
  }
  return subtotal;
};

// Sync meal product quantity and total price for the meal
const syncMealProduct = () => {
  const selectedMeal = cateringStore.cateringEvent.meals![cateringStore.selectedMealIndex];
  
  // Calculate and update total price for each meal product
  selectedMeal.mealProducts.forEach((mealProduct) => {
    const associatedReceiptItems = selectedMeal.receipt.receiptItems
      .filter((receiptItem) => receiptItem.product?.productId === mealProduct.product!.productId);

    // Update mealProduct quantity and totalPrice based on associated receipt items
    mealProduct.quantity = associatedReceiptItems.reduce((sum, item) => sum + item.quantity, 0);
    mealProduct.totalPrice = associatedReceiptItems.reduce((sum, item) => sum + item.receiptSubTotal, 0);
  });

  // Calculate and update total price of the selected meal
  selectedMeal.totalPrice = selectedMeal.mealProducts.reduce((total, mealProduct) => total + mealProduct.totalPrice, 0);
};

// Increase item quantity and update subtotal
const increaseQuantity = (item: ReceiptItem) => {
  item.quantity++;
  item.receiptSubTotal = calculateSubtotal(item);

  // Update total price in catering store
  syncMealProduct();
  cateringStore.updateTotalPrice();
};

// Decrease item quantity and update subtotal
const decreaseQuantity = (item: ReceiptItem, index: number) => {
  if (item.quantity > 1) {
    item.quantity--;
    item.receiptSubTotal = calculateSubtotal(item);
  } else {
    removeItem(index); // If quantity is 1, remove the item instead
  }

  // Update total price in catering store
  syncMealProduct();
  cateringStore.updateTotalPrice();
};

// Remove item from the list and update mealProduct
const removeItem = (index: number) => {
  const item = cateringStore.filteredReceiptItems[index];
  
  // Remove the item from filteredReceiptItems
  cateringStore.filteredReceiptItems.splice(index, 1);

  // Update the selected meal in catering event
  const selectedMeal = cateringStore.cateringEvent.meals![cateringStore.selectedMealIndex];

  // Remove the item from receipt items in the selected meal
  const receiptIndex = selectedMeal.receipt.receiptItems.findIndex(
    (receiptItem) => receiptItem.product?.productId === item.product!.productId && receiptItem === item
  );
  if (receiptIndex !== -1) {
    selectedMeal.receipt.receiptItems.splice(receiptIndex, 1);
  }

  // Remove corresponding mealProduct if there are no remaining receipt items for this product
  const remainingItemsForProduct = selectedMeal.receipt.receiptItems
    .filter((receiptItem) => receiptItem.product?.productId === item.product!.productId);
  
  if (remainingItemsForProduct.length === 0) {
    const mealProductIndex = selectedMeal.mealProducts.findIndex(
      (mealProduct) => mealProduct.product!.productId === item.product!.productId
    );
    if (mealProductIndex !== -1) {
      selectedMeal.mealProducts.splice(mealProductIndex, 1);
    }
    if (selectedMeal.receipt.receiptItems.length === 0) {
      // close dialog if all items are removed
      cateringStore.cateringReceiptItemDialog = false;
    }
  }

  // If all items in receipt are removed, reset the meal data
  if (selectedMeal.receipt.receiptItems.length === 0) {
    selectedMeal.totalPrice = 0;
    selectedMeal.mealProducts = [];
  } else {
    // Recalculate the total price for the selected meal based on remaining receipt items
    selectedMeal.totalPrice = selectedMeal.receipt.receiptItems.reduce((total, receiptItem) => {
      return total + receiptItem.receiptSubTotal;
    }, 0);
  }

  // Update total price and quantities in catering store
  syncMealProduct();
  cateringStore.updateTotalPrice();
};

</script>



<template>
  <v-dialog
    v-model="cateringStore.cateringReceiptItemDialog"
    scrollable fullscreen
    persistent
    :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  >
    <v-card>
      {{ cateringStore.cateringEvent.meals![cateringStore.selectedMealIndex].receipt.receiptItems.filter((item) => item.product?.productId === item.product?.productId).length }}
      <v-card-title>
        รายการสินค้าที่เลือก
      </v-card-title>
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
                      <div v-if="item.product?.haveTopping" class="product-details">
                        {{ item.productType?.productTypeName }} +{{ item.productType?.productTypePrice }} | ความหวาน {{ item.sweetnessLevel }}%
                      </div>
                      <ul v-if="item.productTypeToppings?.length" class="toppings-list">
                        <li
                          v-for="topping in item.productTypeToppings"
                          :key="topping?.topping?.toppingId"
                          class="topping-item"
                        >
                          x{{ topping?.quantity }} {{ topping?.topping?.toppingName }}
                          <span v-if="topping?.topping?.toppingPrice">: {{ topping?.topping?.toppingPrice }}.-</span>
                        </li>
                      </ul>
                    </v-col>
                    
                    <v-col cols="5" class="quantity-controls">
                      <v-btn size="xs-small" color="#C5C5C5" icon @click.stop="decreaseQuantity(item, index)">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                      <span class="quantity">{{ item.quantity }}</span>
                      <v-btn size="xs-small" color="#FF9642" icon @click.stop="increaseQuantity(item)">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" @click.stop="removeItem(index)">
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
        <v-btn color="primary" @click="cateringStore.cateringReceiptItemDialog = false">ปิด</v-btn>
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
