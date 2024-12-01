<script lang="ts" setup>
import { useCheckIngredientStore } from "@/stores/historyIngredientCheck.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dialogImportItem from "./dialogCheck.vue";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import * as XLSX from "xlsx";
import { Workbook } from "exceljs";
import saveAs from "file-saver";
const ingredientStore = useCheckIngredientStore();
const router = useRouter();
const historyCheckDialog = ref(false);
const selectedCheck = ref<Checkingredient | null>(null);
onMounted(async () => {
  await ingredientStore.getAllHistortIngredients();
});

// const formatDate = (dateString: string) => {
//   const options = {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "numeric",
//     minute: "numeric",
//     timeZone: "UTC",
//   };
//   return new Date(dateString).toLocaleDateString("th-TH", options);
// };

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

const openHistoryCheckDialog = (checkingredient: Checkingredient) => {
  ingredientStore.checkingredient = checkingredient;
  ingredientStore.dialogCheckItem = true;
};
function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function exportToExcel(checkingredient: Checkingredient) {
  // Create a new workbook and worksheet
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Check Ingredient Details');

  // Add the first header row: "โครงการร้านค้า Café@Library สำนักหอสมุด"
  worksheet.mergeCells('A1:H1');
  const projectHeaderCell = worksheet.getCell('A1');
  projectHeaderCell.value = 'โครงการร้านค้า Café@Library สำนักหอสมุด';
  projectHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
  projectHeaderCell.font = { name: 'Sarabun', size: 16, bold: true };

  // Add the second header row: "ประวัติการนำสินค้าหมดอายุ"
  worksheet.mergeCells('A2:H2');
  const importHeaderCell = worksheet.getCell('A2');
  importHeaderCell.value = 'ประวัติการนำสินค้าหมดอายุ';
  importHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
  importHeaderCell.font = { name: 'Sarabun', size: 16, bold: true };

  // Add an empty row for spacing
  worksheet.addRow([]);

  // Add column headers
  const headerRowValues = ['ลำดับ', 'วันที่', 'ชื่อวัตถุดิบ', 'ผู้จัดจำหน่าย', 'จำนวนเดิม', 'จำนวน', 'คงเหลือ', 'ผู้รับผิดชอบ'];
  const headerRow = worksheet.addRow(headerRowValues);

  // Apply styles to the column headers for better visibility
  headerRow.font = { name: 'Sarabun', bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add data rows
  checkingredient.checkingredientitem.forEach((item, index) => {
    const remaining = item.oldRemain - item.UsedQuantity; // Calculate remaining quantity
    const rowData = [
      index + 1,
      formatDate(new Date(checkingredient.date)),
      item.ingredient?.ingredientName,
      item.ingredient?.ingredientSupplier,
      item.oldRemain,
      item.UsedQuantity,
      remaining,
      checkingredient.user.userName,
    ];
    const dataRow = worksheet.addRow(rowData);

    // Apply border and alignment to data rows for better presentation
    dataRow.alignment = { vertical: 'middle', horizontal: 'center' };
    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Adjust column widths for better readability
  worksheet.columns.forEach((column) => {
    column.width = 20; // Set a default width for each column
  });

  // Write to a file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `ประวัติการนำสินค้าหมดอายุ_${new Date().toISOString().substring(0, 10)}.xlsx`);
}

</script>

<template>
  <dialogImportItem
    v-model:dialog="historyCheckDialog"
    :checkingredient="selectedCheck"
  />
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9"> ประวัตินำออกวัตถุดิบหมดอายุ </v-col>
          <v-col cols="3">
            <v-text-field
              variant="solo"
              label="ค้นหาประวัติการเช็ควัตถุดิบ"
              append-inner-icon="mdi-magnify"
              hide-details
              dense
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-row class="mb-3">
            <v-col cols="6">
              <v-btn block color="success" :to="{ name: 'ingredients' }" style="font-size: 16px;">
                <v-icon left>mdi-arrow-u-left-top-bold</v-icon>
                ย้อนกลับ
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="success"
                class="button-full-width"
                :to="{ name: 'checkingredient' }"
                style="font-size: 16px;"
              >
                <v-icon left>mdi-plus</v-icon>
                วัตถุดิบหมดอายุ
              </v-btn>
            </v-col>
          </v-row>
        </v-row>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%;">
        <thead>
          <tr>
            <th style="text-align: center; font-weight: bold; font-size: 16px;">
              รหัสประวัติการเช็ควัตถุดิบ
            </th>
            <th style="text-align: center; font-weight: bold; font-size: 16px;">วันที่</th>
            <th style="text-align: center; font-weight: bold; font-size: 16px;">รูปแบบ</th>
            <th style="text-align: center; font-weight: bold; font-size: 16px;">การกระทำ</th>
          </tr>
        </thead>
        <tbody></tbody>
        <tbody>
          <tr
            v-for="(item, index) in ingredientStore.CheckIngredientsHistory"
            :key="index"
          >
            <td style="font-size: 16px;">{{ index + 1 }}</td>
            <td style="font-size: 16px;">{{ formatDate(item.date) }}</td>
            <td :style="{ color: item.actionType, fontSize: '16px' }">
              {{
                item.actionType === "issuing"
                  ? "หมดอายุ"
                  : item.actionType === "check"
                  ? "เช็ควัตถุดิบ"
                  : "เลี้ยงรับรอง"
              }}
            </td>

            <td>
              <v-btn
                color="#ed8731 "
                class="mr-2"
                icon="mdi-pencil"
                @click="openHistoryCheckDialog(item)"
                style="font-size: 16px;"
                ><v-icon color="white" style="font-size: 20px"
                  >mdi-eye-circle</v-icon
                ></v-btn
              >

              <v-btn color="#4CAF50" icon @click="exportToExcel(item)">
                <v-icon color="white" style="font-size: 20px"
                  >mdi-file-excel</v-icon
                >
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.red-text {
  color: red;
}

.yellow-text {
  color: #0d78f3;
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

/* Responsive styles */
@media (max-width: 1024px) {
  th,
  td {
    font-size: 14px;
    padding: 8px;
  }

  .button-full-width {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  th,
  td {
    font-size: 12px;
    padding: 6px;
  }

  .button-full-width {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  th,
  td {
    font-size: 10px;
    padding: 4px;
  }

  .button-full-width {
    font-size: 10px;
  }

  th,
  td {
    white-space: nowrap;
  }

  v-container {
    padding: 0;
    /* ลด padding ของ container */
  }

  v-card {
    margin: 0;
    /* ลด margin ของ card */
  }
}
</style>
