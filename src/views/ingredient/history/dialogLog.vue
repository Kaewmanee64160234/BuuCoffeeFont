<script lang="ts" setup>
import { useSubIngredientStore } from "@/stores/ingredientSubInventory.store";
import { onMounted } from "vue";
const subIngredientStore = useSubIngredientStore();
function closeDialog() {
  subIngredientStore.dialoglog = false;
}
onMounted(async () => {
  await subIngredientStore.getLog();
});
const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};
</script>
<template>
    <v-dialog v-model="subIngredientStore.dialoglog" max-width="50%">
      <v-card>
        <v-card-title>Log รายการวัตถุดิบ</v-card-title>
        <v-card-text>
          <v-table class="text-center mt-5">
            <thead>
              <tr>
                <th class="column-header text-center">ลำดับ</th>
                <th class="column-header text-center">ชื่อวัตถุดิบ</th>
                <th class="column-header text-center">หน่วยที่ใช้รวม</th>
                <th class="column-header text-center">จำนวนที่ขาย</th>
              </tr>
            </thead>
            <tbody>
  <template v-for="(item, index) in subIngredientStore.IngredientLogitem" :key="index">
    <tr>
      <td>{{ index + 1 }}</td>
      <td>{{ item.ingredient.ingredientName }}</td>
      <td style="color: red">- {{ item.usedQuantity }} {{ item.ingredient.ingredientQuantityPerSubUnit }}</td>
      <td>{{ item.unit }}</td>
    </tr>
    <!-- แสดงแถวแยกสำหรับข้อมูลที่มี receiptItemId แตกต่าง -->
    <tr v-if="index < subIngredientStore.IngredientLogitem.length - 1 &&
                item.recieptItem.receiptItemId !== subIngredientStore.IngredientLogitem[index + 1].recieptItem.receiptItemId">
      <td colspan="5" style="border-top: 2px solid black;"></td>
    </tr>
  </template>
</tbody>


          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDialog">ปิด</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  

<style scoped>
.v-table-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.v-table {
  table-layout: fixed;
  width: 100%;
}

.v-table th,
.v-table td {
  width: 25%;
}

.v-card-title {
  background-color: #f5f5f5;
  padding: 16px;
}
</style>
