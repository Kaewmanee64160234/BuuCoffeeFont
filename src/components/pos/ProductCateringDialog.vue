<script setup lang="ts">
import { useCateringStore } from "@/stores/catering.store";
import { CanvasElementContainer } from "html2canvas/dist/types/dom/replaced-elements/canvas-element-container";
import { ref } from "vue";

const cateringStore = useCateringStore();
const quantity = ref(1);

// Define Vuetify validation rules
const nameRules = [
  (v: string) => !!v || "กรุณาระบุชื่อ",
  (v: string) => v.length >= 3 || "ชื่อต้องมีอย่างน้อย 3 ตัวอักษร",
];

const priceRules = [
  (v: number) => !!v || "กรุณาระบุราคา",
  (v: number) => v > 0 || "ราคาต้องมากกว่า 0",
];

const quantityRules = [
  (v: number) => !!v || "กรุณาระบุจำนวน",
  (v: number) => v > 0 || "จำนวนต้องมากกว่า 0",
];

const closeDialog = () => {
  cateringStore.cateringProductDialog = false;
  cateringStore.mealProductEdit = {
    mealId: 0,
    productName: "",
    productPrice: 0,
    quantity: 0,
    totalPrice: 0,
    type: "",
  };
};

const saveProduct = () => {
  // Add your save logic here if needed
  // if rule not pass cannot save
  if (!cateringStore.mealProductEdit.productName) {
    return;
  }
  if (!cateringStore.mealProductEdit.productPrice) {
    return;
  }
  if (!cateringStore.mealProductEdit.quantity) {
    return;
  }
    

  cateringStore.addProductCateringInCaterings(cateringStore.mealProductEdit);
  closeDialog();
};
</script>

<template>
  <v-dialog v-model="cateringStore.cateringProductDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">เพิ่มสินค้าเพื่อเลี้ยงรับรอง</v-card-title>
      <v-card-text>
        <v-container>
          <!-- Product name input with rules -->
          <v-text-field
            v-model="cateringStore.mealProductEdit.productName"
            label="ชื่องานจัดเลี้ยง"
            variant="outlined"
            dense
            required
            clearable
            :rules="nameRules"
            class="mb-4"
          ></v-text-field>

          <!-- Product price input with rules -->
          <v-text-field
            v-model="cateringStore.mealProductEdit.productPrice"
            label="ราคา"
            variant="outlined"
            type="number"
            dense
            required
            clearable
            :rules="priceRules"
            class="mb-4"
          ></v-text-field>

          <!-- Quantity input with rules -->
          <v-text-field
            v-model="cateringStore.mealProductEdit.quantity"
            label="จำนวน"
            variant="outlined"
            type="number"
            dense
            required
            clearable
            :rules="quantityRules"
          ></v-text-field>
        </v-container>
      </v-card-text>

      <!-- Footer with action buttons -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="saveProduct">บันทึก</v-btn>
        <v-btn text color="secondary" @click="closeDialog()">ยกเลิก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card {
  padding: 16px;
}
.v-card-title {
  font-weight: bold;
  text-align: center;
}
</style>
