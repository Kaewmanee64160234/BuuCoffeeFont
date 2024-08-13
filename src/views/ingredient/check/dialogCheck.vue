<script lang="ts" setup>
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';
const ingredientStore = useCheckIngredientStore();
function closeDialog() {
  ingredientStore.checkingredient = null;
  ingredientStore.dialogCheckItem = false;
}
const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};
</script>
<template>
  <v-dialog v-model="ingredientStore.dialogCheckItem" max-width="50%">
    <v-card>
      <v-card-title>
        <v-row justify="center" align="center">
          <v-icon color="primary" style="font-size: 30px;">mdi-calendar-month</v-icon>
          <strong style="font-size: 18px; margin-left: 8px;">รายละเอียดใบเช็ควัตถุดิบ วันที่ : {{
            formatDate(ingredientStore.checkingredient?.date) }}</strong>
        </v-row>


        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-clipboard-text</v-icon>
            <strong style="font-size: 16px;"> รูปแบบ : </strong>
            <span style="font-size: 14px;">
              {{ ingredientStore.checkingredient?.actionType === 'issuing' ? 'นำวัตถุดิบออก' : ( ingredientStore.checkingredient?.actionType === 'check' ? 'เช็ควัตถุดิบ' : 'เลี้ยงรับรอง') }}
            </span>
          </v-col>

          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-account-outline</v-icon>
            <strong style="font-size: 16px;"> ผู้รับผิดชอบ : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.user.userName }}</span>
          </v-col>
        </v-row>

        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-text</v-icon>
            <strong style="font-size: 16px;"> รายละเอียด : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.checkDescription }}</span>
          </v-col>
        </v-row>

      </v-card-title>

      <v-divider></v-divider>


      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th class="column-header text-center">ลำดับ</th>
            <th class="column-header text-center">ชื่อวัตถุดิบ</th>
            <th class="column-header text-center">จำนวน</th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.checkingredient?.checkingredientitem"
            :key="item.CheckIngredientsItemID">
            <th class="column-header text-center">{{ index + 1 }}</th>
            <td>{{ item.ingredient.ingredientName }}</td>
            <td>{{ item.UsedQuantity }} {{ item.ingredient.ingredientUnit }}</td>
          </tr>
        </tbody>
      </v-table>
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
