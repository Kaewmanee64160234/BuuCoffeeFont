<template>
  <v-dialog v-model="ingredientStore.dialogCheckItem" max-width="50%">
    <v-card>
      <v-card-title>Check Ingredient Details</v-card-title>
      <v-table class="text-center mt-5">
  <thead>
    <tr>
      <th class="column-header text-center"></th>
      <th class="column-header text-center">ชื่อวัตถุดิบ</th>
      <th class="column-header text-center">จำนวน</th>
      <th class="column-header text-center">หน่วย</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item, index) in ingredientStore.selectedItems" :key="item.CheckIngredientsItemID">
      <th class="column-header text-center">{{ index + 1 }}</th>
      <td>{{ item.ingredient.ingredientName }}</td>
      <td>{{ item.UsedQuantity }}</td>
      <td>{{ item.ingredient.ingredientUnit  }}</td>
    </tr>
  </tbody>
</v-table>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';

const ingredientStore = useCheckIngredientStore();
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