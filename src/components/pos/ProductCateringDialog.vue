<script setup lang="ts">
import { useCateringStore } from '@/stores/catering.store';
import { ref } from 'vue';

const cateringStore = useCateringStore();
const quantity = ref(1);
</script>

<template>
  <v-dialog
    v-model="cateringStore.cateringProductDialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title class="text-h6">เพิ่มสินค้าเพื่อเลี้ยงรับรอง</v-card-title>
      <v-card-text>
        <v-container>
          <!-- Form product dialog for catering -->
          <!-- Create text field input name -->
          <v-text-field
            v-model="cateringStore.productCatering.productName"
            label="ชื่องานจัดเลี้ยง"
            variant="outlined"
            dense
            required
            clearable
            class="mb-4"
          ></v-text-field>

          <!-- Input price product -->
          <v-text-field
            v-model="cateringStore.productCatering.productPrice"
            label="ราคา"
                        variant="outlined"

            dense
            required
            clearable
            class="mb-4"
          ></v-text-field>

          <!-- Quantity input -->
          <v-text-field
            v-model="quantity"
            label="จำนวน"
                        variant="outlined"

            dense
            required
            clearable
          ></v-text-field>
        </v-container>
      </v-card-text>

      <!-- Optional footer for buttons -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="cateringStore.saveCateringProduct">บันทึก</v-btn>
        <v-btn text color="secondary" @click="cateringStore.cateringProductDialog = false">ยกเลิก</v-btn>
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
