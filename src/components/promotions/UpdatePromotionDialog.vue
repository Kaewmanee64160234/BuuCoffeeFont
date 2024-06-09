<template>
  <v-dialog v-model="promotionStore.updatePromotionDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Update Promotion</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="step" :items="items" show-actions>
          <template v-slot:item.1>
            <h3 class="text-h6">Promotion Details</h3>
            <br>
            <v-form ref="form1">
              <v-text-field v-model="promotionName" label="Promotion Name" required></v-text-field>
              <v-text-field v-model="startDate" label="Start Date" type="date" required></v-text-field>
              <v-checkbox v-model="noEndDate" label="No End Date"></v-checkbox>
              <v-text-field v-if="!noEndDate" v-model="endDate" label="End Date" type="date"></v-text-field>
              <v-select v-model="promotionType" :items="promotionTypes" item-text="text" item-value="value" label="Promotion Type" required></v-select>
              <v-textarea v-model="description" label="Description" required></v-textarea>
            </v-form>
          </template>

          <template v-slot:item.2>
            <h3 class="text-h6">Promotion Type Details</h3>
            <br>
            <v-form ref="form2">
              <template v-if="promotionType === 'discountPrice'">
                <v-text-field v-model="discountValue" label="Discount Value" type="number" required></v-text-field>
              </template>
              <template v-if="promotionType === 'buy1get1'">
                <v-autocomplete v-model="buyProductId" :items="productStore.products" item-text="productName" item-value="id" label="Buy Product" required></v-autocomplete>
                <v-autocomplete v-model="freeProductId" :items="productStore.products" item-text="productName" item-value="id" label="Free Product" required></v-autocomplete>
              </template>
              <template v-if="promotionType === 'usePoints'">
                <v-text-field v-model="pointsRequired" label="Points Required" type="number" required></v-text-field>
                <v-text-field v-model="discountValue" label="Discount Value" type="number" required></v-text-field>
              </template>
              <template v-if="promotionType === 'discountPercentage'">
                <v-text-field v-model="discountPercentage" label="Discount Percentage" type="number" required></v-text-field>
                <v-text-field v-model="minimumPrice" label="Minimum Price for Discount" type="number" required></v-text-field>
              </template>
            </v-form>
          </template>
        </v-stepper>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="step > 1" @click="previousStep">Back</v-btn>
        <v-btn v-if="step < items.length" @click="nextStep">Next</v-btn>
        <v-btn v-if="step === items.length" @click="updatePromotion">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { usePromotionStore } from '@/stores/promotion.store';
import { useProductStore } from '@/stores/product.store';
import type { Promotion } from '@/types/promotion.type';

const promotionStore = usePromotionStore();
const productStore = useProductStore();

const step = ref(1);
const promotionId = ref<number | null>(null);
const promotionName = ref('');
const promotionType = ref('');
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

const promotionTypes = [
  { text: 'Discount by Price', value: 'discountPrice' },
  { text: 'Buy 1 Get 1', value: 'buy1get1' },
  { text: 'Use Points for Discount', value: 'usePoints' },
  { text: 'Discount by Percentage', value: 'discountPercentage' },
];

const items = [
  { title: 'Promotion Details', complete: false },
  { title: 'Promotion Type Details', complete: false },
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
    promotionType.value = promotion.promotionType;
    discountValue.value = promotion.discountValue;
    buyProductId.value = promotion.buyProductId;
    freeProductId.value = promotion.freeProductId;
    pointsRequired.value = promotion.pointsRequired;
    discountPercentage.value = promotion.discountPercentage;
    minimumPrice.value = promotion.minimumPrice;
    startDate.value = promotion.startDate ? new Date(promotion.startDate).toISOString().substr(0, 10) : '';
    endDate.value = promotion.endDate ? new Date(promotion.endDate).toISOString().substr(0, 10) : '';
    description.value = promotion.promotionDescription || '';
    noEndDate.value = promotion.noEndDate;
  }
}

const nextStep = () => {
  step.value++;
};

const previousStep = () => {
  step.value--;
};

const closeDialog = () => {
  // clear all data
  promotionId.value = null;
  promotionName.value = '';
  promotionType.value = '';
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
  // clear promotionStore.promotion
  promotionStore.promotion = null;
  
  promotionStore.updatePromotionDialog = false;
};

const updatePromotion = async () => {
  if (!promotionName.value || !promotionType.value || !startDate.value || (!noEndDate.value && !endDate.value)) {
    return;
  }

  const updatedPromotion: Promotion = {
    promotionId: promotionId.value!,
    promotionName: promotionName.value,
    promotionType: promotionType.value,
    startDate: startDate.value ? new Date(startDate.value) : null,
    endDate: noEndDate.value ? null : (endDate.value ? new Date(endDate.value) : null),
    discountValue: promotionType.value === 'discountPrice' || promotionType.value === 'usePoints' ? discountValue.value : null,
    conditionQuantity: promotionType.value === 'discountPrice' || promotionType.value === 'usePoints' ? 1 : null,
    buyProductId: promotionType.value === 'buy1get1' ? buyProductId.value : null,
    freeProductId: promotionType.value === 'buy1get1' ? freeProductId.value : null,
    conditionValue1: promotionType.value === 'discountPercentage' ? discountPercentage.value : null,
    conditionValue2: promotionType.value === 'discountPercentage' ? minimumPrice.value : null,
    promotionDescription: description.value,
    noEndDate: noEndDate.value,
  };

  await promotionStore.updatePromotion(promotionId.value!, updatedPromotion);
  closeDialog();
};
</script>
