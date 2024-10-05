<template>
  <v-container fluid style="padding-left: 80px;">
    <!-- Event Catering Section -->
    <v-card class="mb-5">
      <v-col > จัดเลี้ยงรับรอง </v-col>
          <!-- Confirmation Section -->
    <v-card style="background-color: #f6d3bb;">
      <v-card-title>สรุปจัดเลี้ยงรับรอง</v-card-title>
      <v-card-text>
        <p style="color: red;">ตรวจสอบรายละเอียดของของคุณก่อนที่จะส่ง</p>
        <p><strong>Event Name:</strong> {{ cateringStore.eventData.eventName }}</p>
        <p><strong>Event Date:</strong> {{ cateringStore.eventData.eventDate }}</p>
        <p><strong>Event Location:</strong> {{ cateringStore.eventData.eventLocation }}</p>
        <p><strong>Attendee Count:</strong> {{ cateringStore.eventData.attendeeCount }} คน</p>
        <p><strong>Total Budget:</strong> {{ totalBudget }} บาท</p>
        <div v-for="(meal, index) in cateringStore.meals" :key="index">
          <p>
            <strong>Meal {{ index + 1 }}:</strong> {{ meal.mealName }} เวลา : {{ meal.mealTime }}, 
            งบประมาณต่อมื้อรวม: {{ meal.totalPrice }} บาท, 
            รายการอาหาร: 
            <span v-for="(ingredient, i) in meal.mealIngredient" :key="i">
                {{ ingredient.ingredient.ingredientName }}<span v-if="i < meal.mealIngredient.length - 1">, </span>
            </span>
        </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-row  >
      <v-col>
        <v-btn    class="custom-button button-full-width"  rounded @click="cateringStore.saveCheckData(1, cateringStore.eventData)">
          <v-icon left>mdi-plus</v-icon>
         <strong>บันทึกข้อมูล</strong> 
        </v-btn>
      </v-col>
    </v-row>
      </v-card-actions>
      <v-card-text style="background-color: #f6d3bb;">
        <v-row>
          <v-col cols="6">
            <v-text-field label="Event Name" v-model="cateringStore.eventData.eventName"  dense hide-details variant="solo"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field label="Event Location" v-model="cateringStore.eventData.eventLocation"  dense hide-details variant="solo"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field label="Event Date" v-model="cateringStore.eventData.eventDate" type="date"  dense hide-details variant="solo"></v-text-field>
          </v-col>
         
          <v-col cols="4">
            <v-text-field label="Attendee Count" v-model.number="cateringStore.eventData.attendeeCount" type="number"  dense hide-details variant="solo"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field label="Total Budget" v-model.number="totalBudget" type="number"  dense hide-details variant="solo" disabled></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    </v-card>
    <MealEntry />



  </v-container>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useCateringStore } from '@/stores/catering.store'; 
import MealEntry from '@/views/ingredient/import/MealEntry.vue';

const cateringStore = useCateringStore();

const totalBudget = computed(() => {
    return cateringStore.meals.reduce((total, meal) => total + meal.totalPrice, 0);
});
</script>

<style scoped>
.custom-button {
  background-color: #FF9642; /* เปลี่ยนเป็นสีที่คุณต้องการ */
  color: white; /* สีตัวอักษร */
}

.custom-button:hover {
  background-color: #2e1d10; /* สีเมื่อเลื่อนเมาส์ไปที่ปุ่ม */
}
.button-full-width {
  width: 100%;
}

.fill-height {
  height: 100%;
}

.fill-width {
  width: 100%;
}

.button-full-width {
  width: 100%;
}

@media (max-width: 768px) {
  .button-full-width {
    font-size: 0.8rem;
    padding: 12px;
  }

  h3 {
    font-size: 1.2rem;
  }
}
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
