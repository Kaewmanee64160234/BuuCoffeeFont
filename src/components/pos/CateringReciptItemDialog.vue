<script setup lang="ts">
import { useCateringStore } from '@/stores/catering.store';
import type { ReceiptItem } from '@/types/receipt.type';
import { ref } from 'vue';

const cateringStore = useCateringStore();


// Define methods for increasing, decreasing, and removing items
const increaseQuantity = (item: ReceiptItem) => {
  item.quantity++;
item.receiptSubTotal = cateringStore.calculateReceiptItem(item);
// update meal total price

  

};

const decreaseQuantity = (item: ReceiptItem) => {
  if (item.quantity > 1) {
    item.quantity--;
    item.receiptSubTotal = item.product!.productPrice * item.quantity; // Update total
  }
};

const removeItem = (index: number) => {
  cateringStore.filteredReceiptItems.splice(index, 1); // Remove from the list
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
    <!-- Dialog Content -->
    <v-card>
      <v-card-title>
        รายการสินค้าที่เลือก
      </v-card-title>
      <v-card-text>
        <!-- Selected Items List -->
        <div class="selected-items-list">
          <v-list>
            <v-list-item-group>
              <!-- Loop through receipt items in the catering event -->
              <div
                v-for="(item, index) in cateringStore.filteredReceiptItems"
                :key="index"
                class="selected-item"
              >
                <v-list-item>
                  <!-- Product Image and Details -->
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
                      <!-- Product Type and Toppings -->
                      <div v-if="item.product?.haveTopping" class="product-details">
                        {{ item.productType?.productTypeName }} +{{ item.productType?.productTypePrice }} | ความหวาน {{ item.sweetnessLevel }}%
                      </div>
                      <div v-else class="product-details">
                        {{ item.product?.productName }} ({{ item.product?.category.categoryName }}) {{ item.product?.productPrice }}.-
                      </div>

                      <!-- Toppings List -->
                      <ul v-if="item.productTypeToppings?.length" class="toppings-list">
                        <li
                          v-for="topping in item.productTypeToppings"
                          :key="topping?.topping?.toppingId"
                          class="topping-item"
                        >
                          x{{ topping?.quantity }} {{ topping?.topping?.toppingName }}
                          <span v-if="topping?.topping?.toppingName.length > 3">: {{ topping?.topping?.toppingPrice }}.-</span>
                        </li>
                      </ul>
                    </v-col>

                    <!-- Quantity Controls -->
                    <v-col cols="5" class="quantity-controls">
                      <v-btn size="xs-small" color="#C5C5C5" icon @click.stop="decreaseQuantity(item)">
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
