<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useCateringStore } from "@/stores/catering.store";
import MealEntry from "@/views/ingredient/catering/MealEntry.vue";
import Swal from "sweetalert2";
import { useRoute } from "vue-router";

const cateringStore = useCateringStore();
const route = useRoute();
const eventId = ref(route.params.eventId as string);

// Fetch the catering event by ID on mount if editing
onMounted(() => {
  if (eventId.value) {
    cateringStore.findCateringEventById(+eventId.value);
  }
});

// Computed property to calculate the total budget
const totalBudget = computed(() => {
  return cateringStore.cateringEvent.meals?.reduce(
    (total, meal) => parseFloat(total+'') + parseFloat( meal.totalPrice+''),
    0
  ) || 0;
});

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const saveCateringEvent = () => {
  if (!cateringStore.cateringEvent.eventName) {
    Swal.fire({
      icon: "error",
      title: "กรุณาใส่ชื่องานจัดเลี้ยง",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

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
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < -2 || diffDays > 2) {
    Swal.fire({
      icon: "error",
      title: "วันที่จัดงานต้องอยู่ในช่วง 2 วันที่ผ่านมา หรือ 2 วันถัดไป",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  if (!cateringStore.cateringEvent.eventLocation || cateringStore.cateringEvent.eventLocation.length < 3) {
    Swal.fire({
      icon: "error",
      title: "สถานที่จัดงานต้องมีอย่างน้อย 3 ตัวอักษร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  if (!cateringStore.cateringEvent.attendeeCount || cateringStore.cateringEvent.attendeeCount < 1) {
    Swal.fire({
      icon: "error",
      title: "จำนวนคนที่เข้าร่วมงานต้องมากกว่า 1 คน",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  if (!cateringStore.cateringEvent.meals || cateringStore.cateringEvent.meals.length === 0) {
    Swal.fire({
      icon: "error",
      title: "กรุณาเพิ่มอาหาร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  if (totalBudget.value <= 0) {
    Swal.fire({
      icon: "error",
      title: "กรุณาเพิ่มรายการอาหาร",
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  // If `eventId` exists, update the event; otherwise, create a new event
  if (eventId.value) {
    cateringStore.updateCateringEvent().then(() => {
      Swal.fire({
        icon: "success",
        title: "อัพเดทข้อมูลเรียบร้อย",
        showConfirmButton: false,
        timer: 1500,
      });
    }).catch(error => {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
        text: error.message,
        showConfirmButton: true,
      });
    });
  } else {
    cateringStore.createCateringEvent().then(() => {
      Swal.fire({
        icon: "success",
        title: "สร้างอีเว้นท์เรียบร้อย",
        showConfirmButton: false,
        timer: 1500,
      });
    }).catch(error => {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการสร้างอีเว้นท์",
        text: error.message,
        showConfirmButton: true,
      });
    });
  }
};
</script>

<template>
  <v-container fluid style="padding-left: 80px">
    <v-card class="mb-5">
      <v-col style="font-size: 24px; font-weight: bold">จัดเลี้ยงรับรอง</v-col>

      <v-card style="background-color: #f6d3bb" class="ma-3">
        <v-card-title>สรุปจัดเลี้ยงรับรอง</v-card-title>
        <v-card-text>
          <p style="color: red; font-size: 17px;">
            *** กรุณาตรวจสอบรายละเอียดของของคุณก่อนที่จะส่ง ***
          </p>
          <p style="font-size: 17px;"><strong>ชื่ออีเว้นท์:</strong> {{ cateringStore.cateringEvent.eventName }}</p>
          <p style="font-size: 17px;"><strong>วันที่จัดอีเว้นท์:</strong> {{ cateringStore.cateringEvent.eventDate }}</p>
          <p style="font-size: 17px;"><strong>สถานที่จัดอีเว้นท์:</strong> {{ cateringStore.cateringEvent.eventLocation }}</p>
          <p style="font-size: 17px;"><strong>จำนวนคนที่เข้าร่วม:</strong> {{ cateringStore.cateringEvent.attendeeCount }} คน</p>
          <p style="font-size: 17px;"><strong>จำนวนเงินทั้งหมดที่ใช้ในงานจัดเลี้ยง:</strong> {{ totalBudget }} บาท</p>
          <div v-for="(meal, index) in cateringStore.cateringEvent.meals" :key="index">
            <p style="font-size: 17px;">
              <strong>มื้ออาหารที่ {{ index + 1 }}:</strong> {{ meal.mealName }} เวลา : {{ meal.mealTime }},
              งบประมาณต่อมื้อรวม: {{ meal.totalPrice }} บาท, รายการอาหาร:
              <span v-for="(ingredient, i) in meal.mealProducts" :key="i">
                {{ ingredient.product ? ingredient.product.productName : ingredient.productName }}
                <span v-if="i < meal.mealProducts.length - 1">, </span>
              </span>
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col>
              <v-btn class="custom-button button-full-width" rounded style="font-size: 17px;" @click="saveCateringEvent">
                <v-icon left>mdi-plus</v-icon>
                <strong>{{ eventId.value ? 'อัพเดทข้อมูล' : 'บันทึกข้อมูล' }}</strong>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
        <v-card-text style="background-color: #f6d3bb">
          <v-row>
            <v-col cols="6">
              <v-text-field label="ชื่ออีเว้นท์" v-model="cateringStore.cateringEvent.eventName" dense hide-details variant="solo"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field label="สถานที่จัดอีเว้นท์" v-model="cateringStore.cateringEvent.eventLocation" dense hide-details variant="solo"></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field label="วันที่จัดอีเว้นท์" v-model="cateringStore.cateringEvent.eventDate" type="date" dense hide-details variant="solo"></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field label="จำนวนคนที่เข้าร่วม" v-model.number="cateringStore.cateringEvent.attendeeCount" type="number" dense hide-details variant="solo"></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field label="จำนวนเงินทั้งหมดที่ใช้ในงานจัดเลี้ยง" :value="totalBudget" type="number" dense hide-details variant="solo" disabled></v-text-field>
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

@media (max-width: 768px) {
  .button-full-width {
    font-size: 0.8rem;
    padding: 12px;
  }
}
</style>
