<script lang="ts" setup>
import { useCateringStore } from "@/stores/catering.store";
import { useCateringEventStore } from "@/stores/historycatering.store";
import type { Meal, MealProduct } from "@/types/catering/meal.type";
import { ref } from "vue";

const cateringEventStore = useCateringEventStore();
const cateringStore = useCateringStore();
const selectedMeal = ref<Meal>({
  mealName: "",
  mealTime: "",
  mealProducts: [],
  totalPrice: 0,
  cateringEventId: 0,
  receipt: {
    receiptId: 0,
    receiptStatus: "",
    receiptType: "",
    receiptItems: [],
    change: 0,
    createdAt: "",
  },
});
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const openProductMealDialog = (meal: Meal) => {
  selectedMeal.value = meal;
  cateringEventStore.dialogCateringItemDetail = true;
};
</script>
<template>
  <!-- Main Catering Event Dialog -->
  <v-dialog v-model="cateringEventStore.dialogCateringItem" max-width="70%">
    <v-card>
      <v-card-title class="title-section">
        <v-row justify="center" align="center">
          <v-icon color="primary" style="font-size: 30px"
            >mdi-calendar-month</v-icon
          >
          <strong style="font-size: 18px; margin-left: 8px">
            {{ cateringStore.cateringHistory!.eventName }} วันที่
            {{ formatDate(cateringStore.cateringHistory!.eventDate + "") }}
            สถานที่จัดเลี้ยง {{ cateringStore.cateringHistory!.eventLocation }}
          </strong>
        </v-row>
        <v-row>
          <v-col style="padding-top: 4px">
            <v-icon color="primary" left style="font-size: 20px"
              >mdi-clipboard-text</v-icon
            >
            <strong style="font-size: 16px"> สถานะ : </strong>
            <span style="font-size: 14px">
              {{
                cateringStore.cateringHistory!.status === "pending"
                  ? "รอดำเนินการ"
                  : cateringStore.cateringHistory!.status === "canceled"
                  ? "ยกเลิก"
                  : "สำเร็จ"
              }}
            </span>
          </v-col>
          <v-col style="padding-top: 4px">
            <v-icon color="primary" left style="font-size: 20px"
              >mdi-account-outline</v-icon
            >
            <strong style="font-size: 16px"> ผู้รับผิดชอบ : </strong>
            <span style="font-size: 14px">
              {{ cateringStore.cateringHistory!.user?.userName }}
            </span>
          </v-col>
        </v-row>
        <v-row>
          <v-col style="padding-top: 4px">
            <v-icon color="primary" left style="font-size: 20px"
              >mdi-text</v-icon
            >
            <strong style="font-size: 16px"> จำนวนคน : </strong>
            <span style="font-size: 14px"
              >{{ cateringStore.cateringHistory!.attendeeCount }} คน</span
            >
          </v-col>
          <v-col style="padding-top: 4px">
            <v-icon color="primary" left style="font-size: 20px"
              >mdi-cash-multiple</v-icon
            >
            <strong style="font-size: 16px"> งบประมาณรวม : </strong>
            <span style="font-size: 14px"
              >{{ cateringStore.cateringHistory!.totalBudget }} บาท</span
            >
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>#</th>
              <th>มื้ออาหาร</th>
              <th>เวลาจัดเลี้ยง</th>
              <th>งบประมาณ</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(meal, index) in cateringStore.cateringHistory!.meals"
              :key="index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ meal.mealName }}</td>
              <td>{{ meal.mealTime }}</td>
              <td>{{ meal.totalPrice }} บาท</td>
              <td>
                <span v-for="(ingredient, i) in meal.mealIngredients" :key="i">
                  {{ ingredient.ingredient.ingredientName
                  }}<span v-if="i < meal.mealIngredients.length - 1">, </span>
                </span>
              </td>
              <td>
                <v-btn icon @click="openProductMealDialog(meal)">
                  <v-icon color="primary">mdi-arrow-right</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- New Product Meal Detail Dialog -->
  <v-dialog
    v-model="cateringEventStore.dialogCateringItemDetail"
    max-width="50%"
  >
    <v-card>
      <v-card-title class="title-section">
        <v-row justify="center" align="center">
          <v-icon color="primary" style="font-size: 30px">mdi-food</v-icon>
          <strong style="font-size: 18px; margin-left: 8px"
            >รายละเอียดมื้ออาหาร</strong
          >
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>ชื่ออาหาร</th>
              <th>ประเภท</th>
              <th>จำนวน</th>
              <th>ราคา</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(mealProduct, index) in selectedMeal.mealProducts"
              :key="index"
            >
              <td v-if="mealProduct.productName">
                {{ mealProduct.productName }}
              </td>
            
              <td v-else>{{ mealProduct.product.productName }}</td>
              <td>{{ mealProduct.type }}</td>
              <td>{{ mealProduct.quantity }}</td>
              <td>{{ mealProduct.totalPrice }} บาท</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.title-section {
  background-color: #f5f5f5;
  padding: 16px;
  font-weight: bold;
}

.v-table-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.v-table {
  table-layout: fixed;
  width: 100%;
  text-align: center;
}

.v-table th,
.v-table td {
  padding: 12px;
}

.table-wide-column {
  width: 300px;
}

@media (max-width: 768px) {
  .v-table th,
  .v-table td {
    font-size: 12px;
    padding: 8px;
  }
}
</style>
