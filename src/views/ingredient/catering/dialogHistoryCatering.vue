<script lang="ts" setup>
import { useCateringStore } from '@/stores/catering.store';
import { useCateringEventStore } from '@/stores/historycatering.store';

const cateringEventStore = useCateringEventStore();
const cateringStore = useCateringStore();
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};
</script>
<template> <v-dialog v-model="cateringEventStore.dialogCateringItem" max-width="50%">
     <v-card>
      <v-card-title>
        <v-row justify="center" align="center">
          <v-icon color="primary" style="font-size: 30px;">mdi-calendar-month</v-icon>
          <strong style="font-size: 18px; margin-left: 8px;">{{ cateringStore.cateringHistory!.eventName }} วันที่  {{
            formatDate(cateringStore.cateringHistory!.eventDate + '') }} สถานที่จัดเลี้ยง {{ cateringStore.cateringHistory!.eventLocation }}</strong>
        </v-row>

        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-clipboard-text</v-icon>
            <strong style="font-size: 16px;"> สถานะ : </strong>
            <span style="font-size: 14px;">
              {{ cateringStore.cateringHistory!.status === 'pending' ? 'รอดำเนินการ' : (  cateringStore.cateringHistory!.status === 'canceled' ? 'ยกเลิก' : 'สำเร็จ') }}
            </span>
            
          </v-col>

          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-account-outline</v-icon>
            <strong style="font-size: 16px;"> ผู้รับผิดชอบ : </strong>
            <span style="font-size: 14px;">{{  cateringStore.cateringHistory!.user.userName }}</span>
          </v-col>
        </v-row>

        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-text</v-icon>
            <strong style="font-size: 16px;"> จำนวนคน : </strong>
            <span style="font-size: 14px;">  {{  cateringStore.cateringHistory!.attendeeCount }} คน</span>
          </v-col>

          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-text</v-icon>
            <strong style="font-size: 16px;"> งบประมาณรวม : </strong>
            <span style="font-size: 14px;">  {{  cateringStore.cateringHistory!.totalBudget }} บาท</span>
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
              <th class="table-wide-column">รายการอาหาร</th>

            </tr>
          </thead>
          <tbody>
            <tr v-for="(meal, index) in cateringStore.cateringHistory!.meals" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ meal.mealName }}</td>
              <td>{{ meal.mealTime }}</td>
              <td>{{ meal.totalPrice }} บาท</td>
              <td>
                <span v-for="(ingredient, i) in meal.mealIngredients" :key="i">
                  {{ ingredient.ingredient.ingredientName }}<span v-if="i < meal.mealIngredients.length - 1">, </span>
                </span>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>



    </v-card></v-dialog></template>
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
    .table-wide-column {
  width: 300px; 
}
    </style>