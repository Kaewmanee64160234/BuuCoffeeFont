<script lang="ts" setup>
import { useHistoryIngredientImportStore } from '@/stores/historyIngredientimport.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import dialogCheckItem from './dialogImport.vue';
import type { Importingredient } from '@/types/importIngredient.type';
import * as XLSX from 'xlsx';
const historyImportDialog = ref(false);
const ingredientStore = useHistoryIngredientImportStore();
const router = useRouter();
const selectedImport = ref<Importingredient | null>(null);
onMounted(async () => {
  await ingredientStore.getAllHistoryImportIngredients();
});

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};
// const formatDate = (date: any) => {
//   if (!date) return ''; // กรณีไม่มีข้อมูลวันที่

//   const jsDate = new Date(date.toString()); // แปลงข้อมูลวันที่เป็น string เป็นวัตถุ Date
//   const formattedDate = jsDate.toLocaleDateString('th-TH', { 
//     day: '2-digit', 
//     month: '2-digit', 
//     year: 'numeric', 
//     timeZone: 'Asia/Bangkok' 
//   }); // กำหนดรูปแบบวันที่ตามที่ต้องการ

//   const formattedTime = jsDate.toLocaleTimeString('th-TH', {
//     hour: '2-digit',
//     minute: '2-digit',
//     timeZone: 'Asia/Bangkok'
//   }); // กำหนดรูปแบบเวลาตามที่ต้องการ

//   return `${formattedDate} เวลา ${formattedTime}`; // รวมวันที่และเวลาเข้าด้วยกัน
// };
const openHistoryCheckDialog = (importingredient: Importingredient) => {
  ingredientStore.importingredient = importingredient;
  ingredientStore.dialoImportItem = true;
};
function exportToExcel(importingredient: Importingredient) {
  const basicData = {
    วันที่: importingredient.date,
    ประเภทร้านค้า: importingredient.importStoreType,
    คำอธิบาย: importingredient.importDescription,
    ผู้รับผิดชอบ: importingredient.user.userName,
  };


  const tableData = importingredient.importingredientitem.map((item, index) => ({
    ลำดับ: index + 1,
    ชื่อวัตถุดิบ: item.ingredient?.ingredientName,
    ซัพพาย: item.ingredient?.ingredientSupplier,
    จำนวน: item.Quantity,
    ราคาต่อขิ้น: item.unitPrice,
    ราคารวม: item.pricePerUnit,
  }));
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet([basicData], { header: Object.keys(basicData) });
  const ws2 = XLSX.utils.json_to_sheet(tableData, { header: Object.keys(tableData[0]) });
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
  XLSX.utils.book_append_sheet(wb, ws2, 'Details');
  XLSX.writeFile(wb, `Import_ingredient_${new Date().toISOString()}.xlsx`);
}
</script>

<template>
  <dialogCheckItem v-model:dialog="historyImportDialog" :importingredient="selectedImport" />
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            ประวัตินำเข้าวัตถุดิบ
          </v-col>
          <v-col cols="3">
            <v-text-field label="ค้นหาประวัตินำเข้าวัตถุดิบ" variant="solo" append-inner-icon="mdi-magnify" hide-details
              dense></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-btn block color="success" :to="{ name: 'ingredients' }">
              <v-icon left>mdi-arrow-u-left-top-bold</v-icon>
              ย้อนกลับ
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block color="success" :to="{ name: 'importingredients' }">
              <v-icon left>mdi-plus</v-icon>
              นำเข้าวัตถุดิบ
            </v-btn>
          </v-col>
        </v-row>

      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>

          <tr>
            <th style="text-align: center;font-weight: bold;">รหัสประวัตินำเข้าวัตถุดิบ</th>
            <th style="text-align: center;font-weight: bold;">วันที่</th>
            <th style="text-align: center;font-weight: bold;">ซัพพาย</th>
            <th style="text-align: center;font-weight: bold;">ราคารวม</th>
            <th style="text-align: center;font-weight: bold;">ส่วนลด</th>
            <th style="text-align: center;font-weight: bold;">รูปแบบ</th>
            <th style="text-align: center;font-weight: bold;">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.importIngredientsHistory" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>{{ item.store }}</td>
            <td>{{ item.total }}</td>
            <td>{{ item.discount }}</td>
            <td>{{ item.importStoreType }}</td>
            <td>
              <v-btn color="#ed8731" class="mr-2" icon="mdi-pencil" @click="openHistoryCheckDialog(item)"><v-icon
                  color="white" style="font-size: 20px;">mdi-eye-circle</v-icon></v-btn>
              <v-btn color="#4CAF50" icon @click="exportToExcel(item)">
                <v-icon color="white" style="font-size: 20px;">mdi-file-excel</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>

        <tbody v-if="!ingredientStore.importIngredientsHistory.length">
          <tr>
            <td colspan="9" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.button-full-width {
  width: 100%;
}

.styled-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.styled-input:focus {
  border-color: #66afe9;
  outline: none;
  box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
}

.styled-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #d9534f;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.styled-button:hover {
  background-color: #c9302c;
}

th,
td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  text-align: center !important;
}

th {
  background-color: #f9f9f9;
}

tbody tr:nth-child(odd) {
  background-color: #f2f2f2;
}

/* Responsive styles */
@media (max-width: 768px) {

  .styled-input,
  .styled-button {
    font-size: 12px;
  }

  th,
  td {
    font-size: 12px;
    padding: 8px !important;
  }

  .button-full-width {
    font-size: 12px;
  }
}

@media (max-width: 480px) {

  .styled-input,
  .styled-button {
    font-size: 10px;
  }

  th,
  td {
    font-size: 10px;
    padding: 6px !important;
  }

  .button-full-width {
    font-size: 10px;
  }

  th,
  td {
    white-space: nowrap;
  }
}
</style>
