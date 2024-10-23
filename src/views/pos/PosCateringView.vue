<script lang="ts" setup>
import { computed, ref } from "vue";
import { useCateringStore } from "@/stores/catering.store";
import MealEntry from "@/views/ingredient/catering/MealEntry.vue";
import Swal from "sweetalert2";

const cateringStore = useCateringStore();

const totalBudget = computed(() => {
  return cateringStore.cateringEvent.meals!.reduce(
    (total, meal) => total + meal.totalPrice,
    0
  );
});

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const createCateringEvent = () => {
  // validate the catering event
  if (!cateringStore.cateringEvent.eventName) {
    Swal.fire({
      icon: "error",
      title: "กรุณาใส่ชื่องานจัดเลี้ยง",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  // charrecter not lessthant 3
  if (cateringStore.cateringEvent.eventName.length < 3) {
    Swal.fire({
      icon: "error",
      title: "ชื่องานจัดเลี้ยงต้องมีอย่างน้อย 3 ตัวอักษร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (!cateringStore.cateringEvent.eventDate) {
    Swal.fire({
      icon: "error",
      title: "กรุณาใส่วันที่จัดงาน",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  const eventDate = new Date(cateringStore.cateringEvent.eventDate);
  const today = new Date();

  const diffTime = eventDate.getTime() - today.getTime(); 
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays < -2) {
    Swal.fire({
      icon: "error",
      title: "วันที่จัดงานต้องไม่เกิน 2 วันที่ผ่านมา",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (!cateringStore.cateringEvent.eventLocation) {
    Swal.fire({
      icon: "error",
      title: "กรุณาใส่สถานที่จัดงาน",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  // charrecter not lessthant 3
  if (cateringStore.cateringEvent.eventLocation.length < 3) {
    Swal.fire({
      icon: "error",
      title: "สถานที่จัดงานต้องมีอย่างน้อย 3 ตัวอักษร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (!cateringStore.cateringEvent.attendeeCount) {
    Swal.fire({
      icon: "error",
      title: "กรุณาใส่จำนวนคนที่เข้าร่วมงาน",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  // morethan 1
  if (cateringStore.cateringEvent.attendeeCount < 1) {
    Swal.fire({
      icon: "error",
      title: "จำนวนคนที่เข้าร่วมงานต้องมากกว่า 1 คน",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  // morethan or equal 1
  if (cateringStore.cateringEvent.meals!.length === 0) {
    Swal.fire({
      icon: "error",
      title: "กรุณาเพิ่มอาหาร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (
    cateringStore.cateringEvent.meals!.reduce(
      (total, meal) => total + meal.totalPrice,
      0
    ) <= 0
  ) {
    Swal.fire({
      icon: "error",
      title: "กรุณาเพิ่มรายการอาหาร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }
  if (cateringStore.cateringEvent.attendeeCount < 1) {
    Swal.fire({
      icon: "error",
      title: "จำนวนคนที่เข้าร่วมงานต้องมากกว่า 1 คน",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  cateringStore.createCateringEvent();
};
</script>
<template>
  <v-container fluid style="padding-left: 80px">
    <!-- Event Catering Section -->
    <v-card class="mb-5">
      <v-col style="font-size: 24px; font-weight: bold">
        จัดเลี้ยงรับรอง
      </v-col>

      <!-- Confirmation Section -->
      <v-card style="background-color: #f6d3bb">
        <v-card-title>สรุปจัดเลี้ยงรับรอง</v-card-title>
        <v-card-text>
          <p style="color: red">ตรวจสอบรายละเอียดของของคุณก่อนที่จะส่ง</p>
          <p>
            <strong>Event Name:</strong>
            {{ cateringStore.cateringEvent.eventName }}
          </p>
          <p>
            <strong>Event Date:</strong>
            {{ cateringStore.cateringEvent.eventDate }}
          </p>
          <p>
            <strong>Event Location:</strong>
            {{ cateringStore.cateringEvent.eventLocation }}
          </p>
          <p>
            <strong>Attendee Count:</strong>
            {{ cateringStore.cateringEvent.attendeeCount }} คน
          </p>
          <p><strong>Total Budget:</strong> {{ totalBudget }} บาท</p>
          <div
            v-for="(meal, index) in cateringStore.cateringEvent.meals!"
            :key="index"
          >
            <p>
              <strong>Meal {{ index + 1 }}:</strong> {{ meal.mealName }} เวลา :
              {{ meal.mealTime }}, งบประมาณต่อมื้อรวม:
              {{ meal.totalPrice }} บาท, รายการอาหาร:
              <span v-for="(ingredient, i) in meal.mealProducts" :key="i">
                {{ ingredient.product.productName
                }}<span v-if="i < meal.mealProducts.length - 1">, </span>
              </span>
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col>
              <v-btn
                class="custom-button button-full-width"
                rounded
                @click="createCateringEvent()"
              >
                <v-icon left>mdi-plus</v-icon>
                <strong>บันทึกข้อมูล</strong>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
        <v-card-text style="background-color: #f6d3bb">
          <v-row>
            <v-col cols="6">
              <v-text-field
                label="Event Name"
                v-model="cateringStore.cateringEvent.eventName"
                dense
                hide-details
                variant="solo"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Event Location"
                v-model="cateringStore.cateringEvent.eventLocation"
                dense
                hide-details
                variant="solo"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Event Date"
                v-model="cateringStore.cateringEvent.eventDate"
                type="date"
                dense
                hide-details
                variant="solo"
              ></v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="Attendee Count"
                v-model.number="cateringStore.cateringEvent.attendeeCount"
                type="number"
                dense
                hide-details
                variant="solo"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Total Budget"
                v-model.number="totalBudget"
                type="number"
                dense
                hide-details
                variant="solo"
                disabled
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card>
    <MealEntry />
    <v-btn class="scroll-to-top" color="primary" @click="scrollToTop" fixed fab>
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
  </v-container>
</template>

<style scoped>
.custom-button {
  background-color: #ff9642;
  color: white;
}

.custom-button:hover {
  background-color: #2e1d10;
}

.button-full-width {
  width: 100%;
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background-color: #ff9642;
  color: white;
}

.scroll-to-top:hover {
  background-color: #2e1d10;
}

.custom-button {
  background-color: #ff9642;
  color: white;
}

.custom-button:hover {
  background-color: #2e1d10;
}

@media (max-width: 768px) {
  .button-full-width {
    font-size: 0.8rem;
    padding: 12px;
  }
}

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
}
</style>
