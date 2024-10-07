<script lang="ts" setup>
import { useCheckIngredientStore } from "@/stores/historyIngredientCheck.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dialogImportItemCatering from "@/views/ingredient/check/dialogCheckCatering.vue";
import { useSubIngredientStore } from "@/stores/ingredientSubInventory.store";
import type { Checkingredient } from "@/types/checkingredientitem.type";
import * as XLSX from "xlsx";

const ingredientStore = useCheckIngredientStore();
const subIngredientStore = useSubIngredientStore();

const router = useRouter();
const historyCheckDialog = ref(false);
const selectedCheck = ref<Checkingredient | null>(null);

onMounted(async () => {
  // Fetching required data for catering shop type, if needed
  // await subIngredientStore.findByShopTypeCatering();
});

// Function to format the date for display
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

// Navigation helper function
const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

// Function to open the history check dialog for a specific ingredient
const openHistoryCheckDialog = async (checkingredient: Checkingredient) => {
  await ingredientStore.getHistoryCheckById(checkingredient.CheckID);
  ingredientStore.checkingredient = checkingredient;
  console.log(ingredientStore.checkingredient);

  ingredientStore.dialogCheckItem = true;
};

// Function to export ingredient check details to Excel
function exportToExcel(checkingredient: Checkingredient) {
  // Format summary data
  const basicData = [
    {
      วันที่: formatDate(checkingredient.date + ''),
      รูปแบบ: checkingredient.actionType === 'withdrawal'
        ? 'เบิกเข้าร้านอาหาร'
        : checkingredient.actionType === 'return'
        ? 'คืนคลังวัตถุดิบ'
        : checkingredient.actionType,
      คำอธิบาย: checkingredient.checkDescription,
      ผู้รับผิดชอบ: checkingredient.user.userName,
    }
  ];

  // Format detailed table data
  const tableData = checkingredient.checkingredientitem.map((item, index) => ({
    ลำดับ: index + 1,
    ชื่อวัตถุดิบ: item.ingredient.ingredientName,
    ผู้จัดจำหน่าย: item.ingredient.ingredientSupplier,
    จำนวนเดิม: item.oldRemain,
    จำนวนนับ: item.UsedQuantity,
  }));

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add headers to the summary and details worksheets
  const projectHeader = ['โครงการร้านค้า Café@Library สำนักหอสมุด'];
  const subHeader = ['นำเข้าสินค้าร้านข้าว'];

  // Create a worksheet for the summary data
  const summaryDataWithHeader = [
    projectHeader,
    subHeader,
    [],
    Object.keys(basicData[0]), // Column headers based on keys of basicData
    ...basicData.map((item) => Object.values(item)), // Summary data rows
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryDataWithHeader);

  // Create a worksheet for the detailed ingredient data
  const detailedDataWithHeader = [
    projectHeader,
    subHeader,
    [],
    Object.keys(tableData[0]), // Column headers based on keys of tableData
    ...tableData.map((item) => Object.values(item)), // Detailed data rows
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(detailedDataWithHeader);

  // Append both sheets to the workbook
  XLSX.utils.book_append_sheet(wb, ws1, "สรุปข้อมูล"); // "Summary" in Thai
  XLSX.utils.book_append_sheet(wb, ws2, "รายละเอียดวัตถุดิบ"); // "Details" in Thai

  // Generate the filename
  const filename = `check_ingredient_${new Date().toISOString().substring(0, 10)}.xlsx`;

  // Write the workbook to a file
  XLSX.writeFile(wb, filename);
}
</script>


<template>
  <dialogImportItemCatering
    v-model:dialog="historyCheckDialog"
    :checkingredient="selectedCheck"
  />
  <v-container>

    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9"> ร้านเลี้ยงรับรอง </v-col>
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
          <tr v-for="(item, index) in subIngredientStore.HistoryCatering" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ formatDate(item.date+'') }}</td>
            <td>
              <span v-if="item.actionType === 'withdrawal'">
                เบิกเข้าร้านเลี้ยงรับรอง
              </span>
              <span v-else-if="item.actionType === 'return'">
                คืนคลังวัตถุดิบ
              </span>
              <span v-else>
                {{ item.actionType === 'withdrawalHistory' ?  'ใช้สินค้าในงานเลี้ยงรับรอง': item.actionType  }}
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
        <tbody v-if="!subIngredientStore.HistoryCatering || subIngredientStore.HistoryCatering.length === 0">
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
