<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import ApexCharts from 'apexcharts';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useProductUsageStore } from '@/stores/report/productUsage.store';

const productUsageStore = useProductUsageStore();
const ingredientStore = useIngredientStore();
const startDate = ref('2024-07-19');
const endDate = ref('2024-12-17');

onMounted(async () => {
  await ingredientStore.getIngredientlow();
});

const ingredientsUsage = computed(() => productUsageStore.ingredientsUsage);
const sortedIngredients = computed(() => {
  return ingredientStore.ingredientlow.slice().sort((a, b) => a.ingredientQuantityInStock - b.ingredientQuantityInStock);
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="text-h5 mb-4">
            <v-icon size="30" class="mr-2">mdi-alert-circle</v-icon>
            วัตถุดิบเหลือน้อย
          </v-card-title>

          <v-table>
            <thead>
              <tr>
                <th class="text-subtitle-1 font-weight-bold">ลำดับ</th>
                <th class="text-subtitle-1 font-weight-bold">ชื่อ</th>
                <th class="text-subtitle-1 font-weight-bold">ผู้จัดหา</th>
                <th class="text-subtitle-1 font-weight-bold">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in sortedIngredients" :key="index" 
                  :class="{'bg-red-lighten-5': item.ingredientQuantityInStock < 0}">
                <td class="text-body-1">{{ index + 1 }}</td>
                <td class="text-body-1">{{ item.ingredientName }}</td>
                <td class="text-body-1">{{ item.ingredientSupplier }}</td>
                <td class="text-body-1">
                  <v-chip
                    :color="item.ingredientQuantityInStock < 0 ? 'error' : 'primary'"
                    class="mr-2"
                  >
                    {{ item.ingredientQuantityInStock }}
                  </v-chip>
                  <v-chip
                    v-if="item.ingredientQuantityInStock < 0"
                    color="error"
                    variant="outlined"
                    size="small"
                  >
                    <v-icon start size="small">mdi-alert</v-icon>
                    อย่าลืม import สินค้าเข้า
                  </v-chip>
                </td>
              </tr>
              <tr v-if="!sortedIngredients.length">
                <td colspan="4" class="text-center text-body-1">ไม่พบข้อมูล</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-table {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.v-table th {
  background-color: #f5f5f5 !important;
  color: rgba(0,0,0,0.87) !important;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.v-table td {
  padding: 12px 16px;
}

.v-card {
  border-radius: 12px;
}

.v-card-title {
  border-bottom: 1px solid #e0e0e0;
}
</style>