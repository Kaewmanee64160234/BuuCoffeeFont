<template>
  <v-dialog v-model="ingredientStore.dialogimportkitem" max-width="800px">
    <v-card>

      <v-card-title>รายละเอียดการนำเข้าวัตถุดิบ</v-card-title>
      <v-table class="text-center mt-5">
  <thead>
    <tr>
      <th class="column-header"></th>
      <th class="column-header">ชื่อวัตถุดิบ</th>
      <th class="column-header">จำนวน</th>
      <th class="column-header">ราคาต่อหน่วย</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item, index) in ingredientStore.selectedItems" :key="item.importIngredientsItemID">
      <th class="column-header">{{ index + 1 }}</th>
      <td>{{ item.ingredient.ingredientName }}</td>
      <td>{{ item.Quantity }}</td>
      <td>{{ item.pricePerUnit }}</td>
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
    width: 100%;
  }
  .v-table th, .v-table td {
    width: 25%; 
  }
</style>
