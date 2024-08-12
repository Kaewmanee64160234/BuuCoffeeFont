<template>
  <v-dialog v-model="ingredientStore.dialogimportkitem" max-width="50%">
    <v-card>

      <v-card-title>รายละเอียดการนำเข้าวัตถุดิบ</v-card-title>
      <v-table class="text-center mt-5" dense>
        <thead>
          <tr>
            <th class="column-header text-center"></th>
            <th class="column-header text-center">ชื่อวัตถุดิบ</th>
            <th class="column-header text-center">จำนวน</th>
            <th class="column-header text-center">ราคาต่อหน่วย</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.selectedItems" :key="item.importIngredientsItemID">
            <td class="column-data text-center">{{ index + 1 }}</td>
            <td class="column-data text-center">{{ item.ingredient.ingredientName }}</td>
            <td class="column-data text-center">{{ item.Quantity }}</td>
            <td class="column-data text-center">{{ item.pricePerUnit }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-card-text>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="ingredientStore.dialogimportkitem = false">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useHistoryIngredientImportStore } from '@/stores/historyIngredientimport.store';

const ingredientStore = useHistoryIngredientImportStore();
</script>

<style scoped>
  .v-table {
    table-layout: fixed;
    width: auto;
  }
  .v-table th, .v-table td {
    text-align: center;
    padding: 8px;
  }
  .column-data {
    width: fit-content;
    text-align: center;
  }
  .column-header {
    width: fit-content;
    font-weight: bold;
    text-align: center;
  }
</style>
