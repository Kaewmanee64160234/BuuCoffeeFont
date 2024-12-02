<script lang="ts" setup>
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import IngredientDialog from "@/components/stock/IngredientDialog.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const subIngredientStore = useSubIngredientStore();
const router = useRouter();
onMounted(async () => {
  await subIngredientStore.getSubIngredients_catering();
  await subIngredientStore.getIngredientsCateringPaginate(); 
});


const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

watch(
    () => subIngredientStore.currentPage, 
    async () => {
        await subIngredientStore.getIngredientsCateringPaginate(); // เรียกฟังก์ชันดึงข้อมูลเมื่อ currentPage เปลี่ยน
    }
);
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9" style="padding: 20px;">
            <h3>คลังวัตถุดิบร้านเลี้ยงรับรอง</h3>
          </v-col>
          <v-col cols="3">
            <v-text-field label="ค้นหารายการวัตถุดิบ" append-inner-icon="mdi-magnify" dense hide-details variant="solo"
              outlined></v-text-field>
          </v-col>
        </v-row>

        <v-row>


          <v-col>
            <v-btn color="success" class="button-full-width" @click="navigateTo('importingredientscatering')">
              <v-icon left>mdi-arrow-down-thick</v-icon>
              นำเข้าวัตถุดิบ
            </v-btn>
          </v-col>

          <v-col>
            <v-btn color="red" class="button-full-width" @click="navigateTo('returningredientcatering')">
              <v-icon left>mdi-arrow-up-thick</v-icon>
              คืนวัตถุดิบ
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
          </tr>
        </thead>
        <tbody v-if="subIngredientStore.subIngredients_catering.length">
          <tr v-for="(item, index) in subIngredientStore.subIngredients_catering.slice((subIngredientStore.currentPage - 1) * subIngredientStore.itemsPerPage, subIngredientStore.currentPage * subIngredientStore.itemsPerPage)" 
              :key="item.ingredient.ingredientId" 
              style="text-align: center;">
            <td>{{ (subIngredientStore.currentPage - 1) * subIngredientStore.itemsPerPage + index + 1 }}</td>
            <td>{{ item.ingredient.ingredientName }}</td>
            <td>{{ item.quantity }}</td>
          </tr>
        </tbody>        
        <tbody v-else>
          <tr>
            <td colspan="3" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
      justify="center" 
      v-model="subIngredientStore.currentPage" 
      :length="Math.ceil(subIngredientStore.totalIngredients / subIngredientStore.itemsPerPage)">
      rounded="circle">
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
