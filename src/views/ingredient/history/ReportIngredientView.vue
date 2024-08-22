<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useSubIngredientStore } from "@/stores/ingredientSubInventory.store";
import dialogLogitem from './dialogLog.vue';
import type { Checkingredient } from "@/types/checkingredientitem.type";
import * as XLSX from "xlsx";
const subIngredientStore = useSubIngredientStore();
const dialogLod = ref(false);
const router = useRouter();
onMounted(async () => {
  await subIngredientStore.getIngredientLog();
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

const openDialog = () => {
  subIngredientStore.dialoglog = true;
};
function exportToExcel(checkingredient: Checkingredient) {
  const basicData = {
    วันที่: checkingredient.date,
    รูปแบบ: checkingredient.actionType,
    คำอธิบาย: checkingredient.checkDescription,
    ผู้รับผิดชอบ: checkingredient.user.userName,
  };

  const tableData = checkingredient.checkingredientitem.map((item, index) => ({
    ลำดับ: index + 1,
    ชื่อวัตถุดิบ: item.ingredient.ingredientName,
    ผู้จัดจำหน่าย: item.ingredient.ingredientSupplier,
    จำนวนเดิม: item.oldRemain,
    จำนวนนับ: item.UsedQuantity,
  }));

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet([basicData], {
    header: Object.keys(basicData),
  });
  const ws2 = XLSX.utils.json_to_sheet(tableData, {
    header: Object.keys(tableData[0]),
  });

  XLSX.utils.book_append_sheet(wb, ws1, "Summary");
  XLSX.utils.book_append_sheet(wb, ws2, "Details");

  XLSX.writeFile(wb, `check_ingredient_${new Date().toISOString()}.xlsx`);
}
</script>

<template>
<dialogLogitem v-model:dialog="dialogLod"/>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">รายงานวัตถุดิบ</v-col>
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
            <v-col cols="6">
              <v-btn block color="success" :to="{ name: 'ingredients' }">
                <v-icon left>mdi-arrow-u-left-top-bold</v-icon>
                ย้อนกลับ
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="success"
                class="button-full-width"
                @click="openDialog">
              >
                <v-icon left>mdi-format-list-bulleted</v-icon>
                show Log
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
            <th style="text-align: center; font-weight: bold">ชื่อวัตถุดิบ</th>
            <th style="text-align: center; font-weight: bold">วันที่เบิก</th>
            <th style="text-align: center; font-weight: bold">จำนวนที่เบิก</th>
            <th style="text-align: center; font-weight: bold">วันที่คืน</th>
            <th style="text-align: center; font-weight: bold">จำนวนที่เหลือ</th>
            <th style="text-align: center; font-weight: bold">
              <v-icon left>mdi-desktop-classic</v-icon>
              หน่วยที่ใช้งานรวม
            </th>
            <th style="text-align: center; font-weight: bold">
              <v-icon left>mdi-desktop-classic</v-icon>
              จำนวนที่ขายไป
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in subIngredientStore.IngredientLog"
            :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ item.ingredientName }}</td>
            <td>{{ formatDate(item.WithdrawalDate) }}</td>
            <td>{{ item.WithdrawalQuantity }}</td>
            <td>{{ formatDate(item.ReturnDate) }}</td>
            <td>{{ item.WithdrawalQuantity - item.ReturnQuantity }}</td>
            <td style="color: blue">{{ item.TotalUsedLogQuantity }}</td>
            <td style="color: blue">{{ item.TotalUnit }}</td>
          </tr>
        </tbody>
        <tbody
          v-if="
            !subIngredientStore.IngredientLog ||
            subIngredientStore.IngredientLog.length === 0
          "
        >
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
