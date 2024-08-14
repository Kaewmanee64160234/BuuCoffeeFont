<script lang="ts" setup>
import { useHistoryIngredientImportStore } from '@/stores/historyIngredientimport.store';
const ingredientStore = useHistoryIngredientImportStore();
function closeDialog() {
  ingredientStore.importingredient = null;
  ingredientStore.dialoImportItem = false;
}
const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};
</script>
<template>
  <v-dialog v-model="ingredientStore.dialoImportItem" max-width="50%">
    <v-card>

      <v-card-title>
        <v-row justify="center" align="center">
          <v-icon color="primary" style="font-size: 30px;">mdi-calendar-month</v-icon>
          <strong style="font-size: 18px; margin-left: 8px;">รายละเอียดใบเช็ควัตถุดิบ วันที่ : {{
            formatDate(ingredientStore.importingredient?.date) }}</strong>
        </v-row>


        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-clipboard-text</v-icon>
            <strong style="font-size: 16px;"> รูปแบบ : </strong>
            <span style="font-size: 14px;">
              {{ ingredientStore.importingredient?.importStoreType }}
            </span>
          </v-col>

          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-account-outline</v-icon>
            <strong style="font-size: 16px;"> ผู้รับผิดชอบ : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.importingredient?.user.userName }}</span>
          </v-col>
        </v-row>

        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-text</v-icon>
            <strong style="font-size: 16px;"> รายละเอียด : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.importingredient?.importDescription }}</span>
          </v-col>
        </v-row>

      </v-card-title>
      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th class="column-header text-center"></th>
            <th class="column-header text-center">ชื่อวัตถุดิบ</th>
            <th class="column-header text-center">จำนวน</th>
            <th class="column-header text-center">ต้นทุน</th>
            <th class="column-header text-center">ราคารวม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.importingredient?.importingredientitem"
            :key="item.importIngredientsItemID">
            <td class="column-data text-center">{{ index + 1 }}</td>
            <td class="column-data text-center">{{ item.ingredient.ingredientName }}</td>
            <td class="column-data text-center">{{ item.Quantity }} {{ item.ingredient?.ingredientUnit }}</td>
            <td class="column-data text-center">{{ item.unitPrice }} บาท</td>
            <td class="column-data text-center">{{ item.pricePerUnit }} บาท</td>
          </tr>
        </tbody>
      </v-table>
      <v-card-text>
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
