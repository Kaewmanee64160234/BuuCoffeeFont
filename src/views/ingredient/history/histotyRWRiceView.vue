<script lang="ts" setup>
import { useCheckIngredientStore } from "@/stores/historyIngredientCheck.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dialogImportItem from "@/views/ingredient/check/dialogCheck.vue";
import { useSubIngredientStore } from "@/stores/ingredientSubInventory.store";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

const ingredientStore = useCheckIngredientStore();
const subIngredientStore = useSubIngredientStore();

const router = useRouter();
const historyCheckDialog = ref(false);
const selectedCheck = ref<Checkingredient | null>(null);

onMounted(async () => {
  await subIngredientStore.findByShopTypeRice();
});

const formatDate = (dateString: string) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "UTC",
  };
  return new Date(dateString).toLocaleDateString("th-TH", options);
};

const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

const openHistoryCheckDialog = (checkingredient: Checkingredient) => {
  ingredientStore.checkingredient = checkingredient;
  ingredientStore.dialogCheckItem = true;
};

// Export to Excel function using exceljs for more styling control
async function exportToExcel(checkingredient: Checkingredient) {
  // Create a new workbook and worksheet
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Check Ingredient Details');

  // Add the first header row: "โครงการร้านค้า Café@Library สำนักหอสมุด"
  worksheet.mergeCells('A1:G1');
  const projectHeaderCell = worksheet.getCell('A1');
  projectHeaderCell.value = 'โครงการร้านค้า Café@Library สำนักหอสมุด';
  projectHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
  projectHeaderCell.font = { name: 'Sarabun', size: 18, bold: true };

  // Add the second header row: "นำเข้าสินค้าร้านข้าว"
  worksheet.mergeCells('A2:G2');
  const importHeaderCell = worksheet.getCell('A2');
  importHeaderCell.value = 'นำเข้าสินค้าร้านข้าว';
  importHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
  importHeaderCell.font = { name: 'Sarabun', size: 16, bold: true };

  // Add an empty row for spacing
  worksheet.addRow([]);

  // Add column headers
  const headerRow = worksheet.addRow([
    'ลำดับ', 'วันที่', 'รายการ', 'ประเภท', 'จำนวน', 'หน่วย', 'ผู้รับผิดชอบ'
  ]);
  headerRow.font = { name: 'Sarabun', bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add border to the column headers for better visibility
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
        ? 'เบิกเข้าร้านข้าว'
        : checkingredient.actionType === 'return'
        ? 'คืนคลังวัตถุดิบ'
        : checkingredient.actionType,
      item.UsedQuantity,
      item.ingredient.ingredientUnit,
      checkingredient.user.userName,
    ];
    const dataRow = worksheet.addRow(rowData);

    // Apply styles to data rows
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

  // Set the width of the columns for better readability
  worksheet.columns.forEach((column) => {
    column.width = 20; // Set a default width for each column
  });

  // Write to a file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `check_ingredient_${new Date().toISOString().substring(0, 10)}.xlsx`);
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
          <v-col cols="9"> ร้านข้าว </v-col>
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
            >
              <v-icon left>mdi-arrow-u-left-top-bold </v-icon> ย้อนกลับ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-table class="mx-auto" style="width: 97%">
        <thead>
          <tr>
            <th style="text-align: center; font-weight: bold">
              รหัสประวัติการเช็ควัตถุดิบ
            </th>
            <th style="text-align: center; font-weight: bold">วันที่</th>
            <th style="text-align: center; font-weight: bold">รูปแบบ</th>
            <th style="text-align: center; font-weight: bold">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in subIngredientStore.HistoryRice" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>
              <span v-if="item.actionType === 'withdrawal'">
                เบิกเข้าร้านข้าว
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
        <tbody v-if="!subIngredientStore.HistoryRice || subIngredientStore.HistoryRice.length === 0">
            <tr>
              <td colspan="4" class="text-center">ไม่มีข้อมูล</td>
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
