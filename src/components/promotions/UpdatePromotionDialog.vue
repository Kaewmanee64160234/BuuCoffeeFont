<template>
  <v-dialog v-model="promotionStore.updatePromotionDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">แก้ไขโปรโมชั่น</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="step" :items="items" show-actions>
          <template v-slot:item.1>
            <h3 class="text-h6">รายละเอียดโปรโมชั่น</h3>
            <br>
            <v-form ref="form1">
              <v-text-field v-model="promotionName" label="ชื่อโปรโมชั่น" required></v-text-field>
              <v-text-field v-model="startDate" label="วันที่เริ่มต้น" type="date" required></v-text-field>
              <v-checkbox v-model="noEndDate" label="ไม่มีวันสิ้นสุด"></v-checkbox>
              <v-text-field v-if="!noEndDate" v-model="endDate" label="วันที่สิ้นสุด" type="date"></v-text-field>
              <v-select v-model="promotionTypeName"
                :items="promotionStore.promotionTypes.map(promotionType_ => promotionType_.text)" item-text="text"
                item-value="value" label="ประเภทโปรโมชั่น" required></v-select>
              <v-select v-model="promotionStore_" :items="store" item-text="text" item-value="value"
                label="ร้านที่ใช้promotion" required></v-select>
              <v-checkbox v-model="promotionCanUseManyTimes" label="โปรโมชั่นนี้สามารถใช้ได้หลายครั้ง"></v-checkbox>
              <v-textarea v-model="description" label="คำอธิบาย" required></v-textarea>
            </v-form>
          </template>

          <template v-slot:item.2>
            <h3 class="text-h6">รายละเอียดประเภทโปรโมชั่น</h3>
            <br>
            <v-form ref="form2">
              <template v-if="promotionTypeValue === 'discountPrice'">
                <v-text-field v-model="discountValue" label="มูลค่าส่วนลด" type="number" required></v-text-field>
              </template>
              <template v-if="promotionTypeValue === 'buy1get1'">
                <v-autocomplete v-model="productBuy" :items="productStore.products.map(product => product.productName)"
                  item-text="productName" item-value="id" label="ซื้อสินค้า" required></v-autocomplete>
                <v-autocomplete v-model="productFree" :items="productStore.products.map(product => product.productName)"
                  item-text="productName" item-value="id" label="สินค้าฟรี" required></v-autocomplete>
              </template>
              <template v-if="promotionTypeValue === 'usePoints'">
                <v-text-field v-model="pointsRequired" label="คะแนนที่ต้องใช้" type="number" required></v-text-field>
                <v-text-field v-model="discountValue" label="มูลค่าส่วนลด" type="number" required></v-text-field>
              </template>
              <template v-if="promotionTypeValue === 'discountPercentage'">
                <v-text-field v-model="discountValue" label="เปอร์เซ็นต์ส่วนลด" type="number" required></v-text-field>
                <v-text-field v-model="minimumPrice" label="ราคาขั้นต่ำสำหรับส่วนลด" type="number"
                  required></v-text-field>
              </template>
            </v-form>
          </template>
        </v-stepper>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="step === items.length" @click="updatePromotion">ยืนยัน</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { usePromotionStore } from '@/stores/promotion.store';
import { useProductStore } from '@/stores/product.store';
import type { Promotion } from '@/types/promotion.type';
import Swal from 'sweetalert2';

const promotionStore = usePromotionStore();
const productStore = useProductStore();

const step = ref(1);
const promotionName = ref('');
const discountValue = ref<number | null>(null);
const buyProductId = ref<number | null>(null);
const freeProductId = ref<number | null>(null);
const pointsRequired = ref<number | null>(null);
const discountPercentage = ref<number | null>(null);
const minimumPrice = ref<number | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const description = ref('');
const noEndDate = ref(false);
const promotionCanUseManyTimes = ref(false);
const promotionStore_ = ref('');
const promotionTypeName = ref('');
const promotionTypeValue = ref('');
const promotionId = ref<number | null>(null);
const productFree = ref('');
const productBuy = ref('');
const store = ['ร้านกาแฟ', 'ร้านข้าว'];

const items = [
  { title: 'รายละเอียดโปรโมชั่น', complete: false },
  { title: 'รายละเอียดประเภทโปรโมชั่น', complete: false },
];

onMounted(async () => {
  await productStore.getAllProducts();
  loadPromotionData();
});

watch(() => promotionStore.promotion, loadPromotionData, { immediate: true });

function loadPromotionData() {
  if (promotionStore.promotion) {
    const promotion: Promotion = promotionStore.promotion;
    promotionId.value = promotion.promotionId;
    promotionName.value = promotion.promotionName;
    promotionTypeName.value = promotionStore.promotionTypes.find(promotion_ => promotion_.value === promotion.promotionType)?.text;
    promotionTypeValue.value = promotionStore.promotionTypes.find(promotion_ => promotion_.value === promotion.promotionType)?.value;
    discountValue.value = promotion.discountValue;
    buyProductId.value = promotion.buyProductId;
    freeProductId.value = promotion.freeProductId;
    pointsRequired.value = promotion.conditionValue1;
    discountPercentage.value = promotion.discountValue;
    minimumPrice.value = promotion.conditionValue1;
    startDate.value = promotion.startDate ? new Date(promotion.startDate).toISOString().substr(0, 10) : '';
    endDate.value = promotion.endDate ? new Date(promotion.endDate).toISOString().substr(0, 10) : '';
    description.value = promotion.promotionDescription || '';
    noEndDate.value = promotion.noEndDate;
    promotionStore_.value = promotion.promotionForStore;
    promotionCanUseManyTimes.value = promotion.promotionCanUseManyTimes;
    if (promotion.buyProductId) {
      productBuy.value = productStore.products.find(product => product.productId === promotion.buyProductId)?.productName;
    }
    if (promotion.freeProductId) {
      productFree.value = productStore.products.find(product => product.productId === promotion.freeProductId)?.productName;
    }
    if(promotion.promotionType === 'usePoints'){
      pointsRequired.value = promotion.conditionQuantity;

    }
  }
}

const nextStep = () => {
  step.value++;
};

const previousStep = () => {
  step.value--;
};

const closeDialog = async () => {
  // clear all data
  promotionId.value = null;
  promotionName.value = '';
  promotionTypeName.value = '';
  promotionTypeValue.value = '';
  discountValue.value = null;
  buyProductId.value = null;
  freeProductId.value = null;
  pointsRequired.value = null;
  discountPercentage.value = null;
  minimumPrice.value = null;
  startDate.value = null;
  endDate.value = null;
  description.value = '';
  noEndDate.value = false;
  step.value = 1;
  promotionStore.promotion = null;
  promotionStore.updatePromotionDialog = false;
  promotionCanUseManyTimes.value = false;
  productFree.value = null;
  productBuy.value = null;
  await productStore.getAllProducts();
};

const updatePromotion = async () => {
  if (!promotionName.value || !promotionTypeValue.value || !startDate.value || (!noEndDate.value && !endDate.value)) {
    return;
  }

  const updatedPromotion: Promotion = {
    promotionName: promotionName.value,
    promotionType: promotionTypeValue.value,
    startDate: new Date(startDate.value),
    endDate: noEndDate.value ? null : new Date(endDate.value),
    discountValue: promotionTypeValue.value === 'discountPrice' || promotionTypeValue.value === 'usePoints' || promotionTypeValue.value === 'discountPercentage' ? discountValue.value : null,
    conditionQuantity: promotionTypeValue.value === 'discountPrice' || promotionTypeValue.value === 'usePoints' ? pointsRequired.value : null,
    buyProductId: promotionTypeValue.value === 'buy1get1' ? productStore.products.find(product => product.productName === productBuy.value)?.productId : null,
    freeProductId: promotionTypeValue.value === 'buy1get1' ? productStore.products.find(product => product.productName === productFree.value)?.productId : null,
    conditionValue1: promotionTypeValue.value === 'discountPercentage' ? minimumPrice.value : null,
    conditionValue2: promotionTypeValue.value === 'discountPercentage' ? minimumPrice.value : null,
    promotionDescription: description.value,
    noEndDate: noEndDate.value,
    promotionForStore: promotionStore_.value,
    promotionCanUseManyTimes: promotionCanUseManyTimes.value,
  };


  if (promotionTypeValue.value === 'usePoints' && !pointsRequired.value) {
    updatedPromotion.conditionValue1 = pointsRequired.value;
  }

  await promotionStore.updatePromotion(promotionId.value!, updatedPromotion);
  closeDialog();

  Swal.fire({
    icon: 'success',
    title: 'สำเร็จ',
    text: 'โปรโมชั่นถูกแก้ไขเรียบร้อยแล้ว',
    confirmButtonText: 'ตกลง',
    customClass: {
      confirmButton: 'swal-button'
    }
  });
};
</script>

<style scoped>
.swal-button {
  font-size: 16px;
}
</style>
