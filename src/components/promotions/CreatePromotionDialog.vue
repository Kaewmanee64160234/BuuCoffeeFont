<template>
  <v-dialog v-model="promotionStore.createPromotionDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">สร้างโปรโมชั่น</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="step" :items="items" show-actions>
          <template v-slot:item.1>
            <h3 class="text-h6">รายละเอียดโปรโมชั่น</h3>
            <br>
            <v-form ref="form1">
              <v-text-field 
                v-model="promotionName" 
                label="ชื่อโปรโมชั่น" 
                :rules="[ v => !!v || 'กรุณากรอกชื่อโปรโมชั่น',]"
                required
              ></v-text-field>
              <v-text-field v-model="startDate" label="วันที่เริ่มต้น" type="date" :rules="[v => !!v || 'กรุณาเลือกวันที่เริ่มต้น']" required></v-text-field>
              <v-checkbox v-model="noEndDate" label="ไม่มีวันสิ้นสุด"></v-checkbox>
              <v-text-field 
                v-if="!noEndDate"
                  v-model="endDate"
                  label="วันที่สิ้นสุด"
                  type="date"
                  :rules="[ v => !!v || 'กรุณาเลือกวันที่สิ้นสุด']"
                  :disabled="noEndDate"
                  required
              ></v-text-field>
              <v-select v-model="promotionTypeName"
                :items="promotionStore.promotionTypes.map(promotionType_ => promotionType_.text)" item-text="text"
                item-value="value" label="ประเภทโปรโมชั่น" :rules="[v => !!v || 'กรุณาเลือกประเภทโปรโมชั่น']" required></v-select>
              <v-select v-model="promotionStore_" :items="store" item-text="text" item-value="value"
                label="ร้านที่ใช้promotion" :rules="[v => !!v || 'กรุณาเลือกร้านที่ใช้โปรโมชั่น']" required></v-select>
              <v-checkbox v-model="promotionCanUseManyTimes" label="โปรโมชั่นนี้สามารถใช้ได้หลายครั้ง"></v-checkbox>
              <v-textarea v-model="description" label="คำอธิบาย" required></v-textarea>
            </v-form>
          </template>

          <template v-slot:item.2>
            <h3 class="text-h6">รายละเอียดประเภทโปรโมชั่น</h3>
            <br>
            <v-form ref="form2">
              <template v-if="promotionTypeValue === 'discountPrice'">
                <v-text-field v-model="discountValue" label="มูลค่าส่วนลด" type="number" :rules="[v => !!v || 'กรุณากรอกมูลค่าส่วนลด โดยกรอกเป็นตัวเลขเท่านั้น']" required></v-text-field>
              </template>
              <template v-if="promotionTypeValue === 'buy1get1'">
                <v-autocomplete v-model="buyProductId"
                  :items="productStore.products.map(product => product.productName)" item-text="productName"
                  item-value="id" label="ซื้อสินค้า" :rules="[v => !!v || 'กรุณาเลือกสินค้าที่ซื้อ']" required></v-autocomplete>
                <v-autocomplete v-model="freeProductId"
                  :items="productStore.products.map(product => product.productName)" item-text="productName"
                  item-value="id" label="สินค้าฟรี" :rules="[v => !!v || 'กรุณาเลือกสินค้าฟรี']" required></v-autocomplete>
              </template>
              <template v-if="promotionTypeValue === 'usePoints'">
                <v-text-field v-model="pointsRequired" label="คะแนนที่ต้องใช้" type="number" :rules="[v => !!v || 'กรุณากรอกคะแนนที่ต้องใช้ โดยกรอกเป็นตัวเลขเท่านั้น']" required></v-text-field>
                <v-text-field v-model="discountValue" label="มูลค่าส่วนลด" type="number" :rules="[v => !!v || 'กรุณากรอกมูลค่าส่วนลด โดยกรอกเป็นตัวเลขเท่านั้น']" required></v-text-field>
              </template>
              <template v-if="promotionTypeValue === 'discountPercentage'">
                <v-text-field v-model="discountValue" label="เปอร์เซ็นต์ส่วนลด" type="number" :rules="[v => !!v || 'กรุณากรอกเปอร์เซ็นต์ส่วนลด โดยกรอกเป็นตัวเลขเท่านั้น']" required></v-text-field>
                <v-text-field v-model="minimumPrice" label="ราคาขั้นต่ำสำหรับส่วนลด" type="number" :rules="[v => !!v || 'กรุณากรอกราคาขั้นต่ำสำหรับส่วนลด โดยกรอกเป็นตัวเลขเท่านั้น']" required></v-text-field>
              </template>
            </v-form>
          </template>
        </v-stepper>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="step === items.length" @click="createPromotion">สร้าง</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { usePromotionStore } from '@/stores/promotion.store';
import { useProductStore } from '@/stores/product.store';
import type { Promotion } from '@/types/promotion.type';
import Swal from 'sweetalert2';

const promotionStore = usePromotionStore();
const productStore = useProductStore();

const step = ref(1);
const promotionName = ref('โปรโมชั่นใหม่'); // Default value
const discountValue = ref<number | null>(10); // Default value for discount
const buyProductId = ref<number | null>(null);
const freeProductId = ref<number | null>(null);
const pointsRequired = ref<number | null>(null);
const discountPercentage = ref<number | null>(null);
const minimumPrice = ref<number | null>(null);
const startDate = ref<string | null>(new Date().toISOString().substr(0, 10)); // Default to today's date
const endDate = ref<string | null>(new Date().toISOString().substr(0, 10));
const description = ref('รายละเอียดโปรโมชั่น'); // Default value
const noEndDate = ref(false);
const promotionCanUseManyTimes = ref(false);
const promotionStore_ = ref('ร้านกาแฟ'); // Default store
const promotionTypeName = ref('');
const promotionTypeValue = ref('');

const store = ['ร้านกาแฟ', 'ร้านข้าว'];

watch(() => promotionTypeName.value, (newValue) => {
  promotionStore.promotionTypes.forEach(promotionType => {
    if (promotionType.text === newValue) {
      promotionTypeValue.value = promotionType.value;
    }
  });
});

const items = [
  { title: 'รายละเอียดโปรโมชั่น', complete: false },
  { title: 'รายละเอียดประเภทโปรโมชั่น', complete: false },
];

const closeDialog = () => {
  // clear all data
  promotionName.value = '';
  promotionTypeName.value = '';
  promotionTypeValue.value = '';
  discountValue.value = null;
  buyProductId.value = null;
  freeProductId.value = null;
  pointsRequired.value = null;
  discountPercentage.value = null;
  minimumPrice.value = null;
  startDate.value = new Date().toISOString().substr(0, 10); // Reset to today's date
  endDate.value = null;
  description.value = '';
  noEndDate.value = false;
  step.value = 1;
  promotionStore.promotion = null;
  promotionStore.createPromotionDialog = false;
  promotionCanUseManyTimes.value = false;

  // Reset validation for all forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => form.reset());
};

const createPromotion = async () => {
  if (!promotionName.value || !promotionTypeValue.value || !startDate.value || (!noEndDate.value && !endDate.value)) {
    promotionStore.createPromotionDialog = false;
    Swal.fire({
      title: 'ข้อมูลไม่ครบถ้วน',
      text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    }).then(() => {
      promotionStore.createPromotionDialog = true;
      step.value = 1;
    });
    return;
  }

  const newPromotion: Promotion = {
    promotionName: promotionName.value,
    promotionType: promotionTypeValue.value,
    startDate: new Date(startDate.value),
    endDate: noEndDate.value ? null : new Date(endDate.value),
    discountValue: promotionTypeValue.value === 'discountPrice' || promotionTypeValue.value === 'usePoints' || promotionTypeValue.value === 'discountPercentage' ? discountValue.value : null,
    conditionQuantity: promotionTypeValue.value === 'usePoints' ? pointsRequired.value : null,
    buyProductId: promotionTypeValue.value === 'buy1get1' ? productStore.products.find(product => product.productName === buyProductId.value)?.productId : null, 
    freeProductId: promotionTypeValue.value === 'buy1get1' ? productStore.products.find(product => product.productName === freeProductId.value)?.productId : null,

    conditionValue1: promotionTypeValue.value === 'discountPercentage' ? minimumPrice.value : null,
    conditionValue2: promotionTypeValue.value === 'discountPercentage' ? minimumPrice.value : null,
    promotionDescription: description.value,
    noEndDate: noEndDate.value,
    promotionForStore: promotionStore_.value,
    promotionCanUseManyTimes: promotionCanUseManyTimes.value,
  };

  await promotionStore.createPromotion(newPromotion);

  Swal.fire({
    title: 'สำเร็จ',
    text: 'โปรโมชั่นถูกสร้างเรียบร้อยแล้ว',
    icon: 'success',
    confirmButtonText: 'ตกลง',
    customClass: {
      confirmButton: 'swal-button'
    }
  }).then(() => {
    closeDialog(); // Close the dialog after the SweetAlert is dismissed
  });
};
</script>


<style scoped>
.swal-button {
  font-size: 16px;
}
</style>
