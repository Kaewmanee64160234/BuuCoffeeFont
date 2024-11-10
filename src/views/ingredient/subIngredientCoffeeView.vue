<script lang="ts" setup>
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import {  onMounted } from "vue";
import { useRouter } from 'vue-router';

const subIngredientStore = useSubIngredientStore();
const router = useRouter();
onMounted(async () => {
  await subIngredientStore.getSubIngredients_coffee();
  await subIngredientStore.getIngredientsCoffeePaginate();
});
const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
</script>
<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9" style="padding: 20px;">
            <h3>คลังวัตถุดิบร้านกาแฟ</h3>
          </v-col>
          <v-col cols="3">
            <v-text-field
              label="ค้นหารายการวัตถุดิบ"
              append-inner-icon="mdi-magnify"
              dense
              hide-details
              variant="solo"
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn color="success" class="button-full-width" @click="navigateTo('importingredientscoffee')">
              <v-icon left>mdi-arrow-down-thick</v-icon>
              นำเข้าวัตถุดิบ
            </v-btn>
          </v-col>

          <v-col>
            <v-btn class="button-full-width custom-yellow" @click="navigateTo('returningredientcoffee')">
              <v-icon left>mdi-inbox</v-icon>
              ปรับสต็อก
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th style="text-align: center;font-weight: bold;">รหัสวัตถุดิบ</th>
            <th style="text-align: center;font-weight: bold;">ชื่อวัตถุดิบ</th>
            <th style="text-align: center;font-weight: bold;">จำนวนคงเหลือ</th>
            <th style="text-align: center;font-weight: bold;">จำนวนที่ถูกจองเพื่อจัดเลี้ยง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in subIngredientStore.subingredients_coffee.slice((subIngredientStore.currentPage - 1) * subIngredientStore.itemsPerPage, subIngredientStore.currentPage * subIngredientStore.itemsPerPage)" 
              :key="item.ingredient.ingredientId" 
              style="text-align: center;">
              <td>{{ (subIngredientStore.currentPage - 1) * subIngredientStore.itemsPerPage + index + 1 }}</td>
              <td>{{ item.ingredient.ingredientName }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.reservedQuantity }}</td>
          </tr>
          <tr v-if="subIngredientStore.subingredients_coffee.length === 0">
              <td colspan="3" class="text-center">ไม่มีข้อมูล</td>
          </tr>
      </tbody>
        
      </v-table>

      <!-- <v-pagination 
        justify="center" 
        v-model="subIngredientStore.currentPage" 
        :length="Math.ceil(subIngredientStore.totalIngredients / subIngredientStore.itemsPerPage)">
        rounded="circle">
      </v-pagination> -->
      <v-pagination
        justify="center"
        v-model="subIngredientStore.currentPage"
        :length="Math.ceil(subIngredientStore.totalIngredients / subIngredientStore.itemsPerPage)"
        @input="subIngredientStore.getIngredientsCoffeePaginate "
        rounded="circle"
      ></v-pagination>

    </v-card>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

.button-full-width {
  width: 100%;
  
}
.custom-yellow {
  background-color: rgb(255, 217, 0); 
  color: black; 
}

th,
td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  text-align: center !important;
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .v-card-title {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .v-col {
    padding: 10px 0;
  }

  .button-full-width {
    margin-bottom: 10px;
  }

  .v-text-field {
    width: 100%;
    margin-bottom: 10px;
  }

  .v-table {
    overflow-x: auto;
  }
}
</style>
