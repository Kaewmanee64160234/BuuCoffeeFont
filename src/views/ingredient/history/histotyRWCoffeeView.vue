<script lang="ts" setup>
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver'; // Make sure this is imported
import { useCheckIngredientStore } from "@/stores/historyIngredientCheck.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dialogImportItem from "@/views/ingredient/check/dialogCheck.vue";
import { useSubIngredientStore } from "@/stores/ingredientSubInventory.store";
import type { Checkingredient } from "@/types/checkingredientitem.type";

const ingredientStore = useCheckIngredientStore();
const subIngredientStore = useSubIngredientStore();

const router = useRouter();
const historyCheckDialog = ref(false);
const selectedCheck = ref<Checkingredient | null>(null);

onMounted(async () => {
  await subIngredientStore.findByShopType();
});
function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
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

// Export to Excel with ExcelJS and File-Saver
async function exportToExcel(checkingredient: Checkingredient) {
  // Create a new workbook and worksheet
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Check Ingredient Details');

  // Add the first header row: "โครงการร้านค้า Café@Library สำนักหอสมุด"
  worksheet.mergeCells('A1:G1');
  const projectHeaderCell = worksheet.getCell('A1');
  projectHeaderCell.value = 'โครงการร้านค้า Café@Library สำนักหอสมุด';
  projectHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
  projectHeaderCell.font = { name: 'Sarabun', size: 16, bold: true };

  // Add the second header row: "นำเข้าสินค้าร้านกาแฟ"
  worksheet.mergeCells('A2:G2');
  const importHeaderCell = worksheet.getCell('A2');
  importHeaderCell.value = 'นำเข้าสินค้าร้านกาแฟ';
  importHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
  importHeaderCell.font = { name: 'Sarabun', size: 16, bold: true };

  // Add an empty row for spacing
  worksheet.addRow([]);

  // Add column headers
  const headerRowValues = ['ลำดับ', 'วันที่', 'รายการ', 'ประเภท', 'จำนวน', 'หน่วย', 'ผู้รับผิดชอบ'];
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
    const rowData = [
      index + 1,
      formatDate(checkingredient.date + ''),
      item.ingredient.ingredientName,
      checkingredient.actionType === 'withdrawal'
        ? 'เบิกเข้าร้านกาแฟ'
        : checkingredient.actionType === 'return'
        ? 'คืนคลังวัตถุดิบ'
        : checkingredient.actionType,
      item.UsedQuantity,
      item.ingredient.ingredientUnit,
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
  saveAs(blob, `นำเข้ารายการสินค้าร้านกาแฟ${new Date().toISOString().substring(0, 10)}.xlsx`);
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
          <v-col cols="9"> ร้านกาแฟ </v-col>
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
          <v-col>
            <v-btn
              color="success"
              class="button-full-width"
              :to="{ name: 'ingredients' }"
              style="font-size: 16px;"
            >
              <v-icon left>mdi-arrow-u-left-top-bold </v-icon> ย้อนกลับ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
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
          <tr v-for="(item, index) in subIngredientStore.History" :key="index">
            <td style="font-size: 16px;">{{ index + 1 }}</td>
            <td style="font-size: 16px;">{{ formatDate(item.date) }}</td>
            <td style="font-size: 16px;">
              <span v-if="item.actionType === 'withdrawal'">
                เบิกเข้าร้านกาแฟ
              </span>
              <span v-else-if="item.actionType === 'return'">
                คืนคลังวัตถุดิบ
              </span>
              <span v-else>
                {{ item.actionType }}
              </span>
            </td>

            <td>
              <v-btn
                color="#ed8731 "
                class="mr-2"
                icon="mdi-pencil"
                @click="openHistoryCheckDialog(item)"
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
