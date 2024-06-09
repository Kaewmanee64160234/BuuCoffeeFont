<template>
    <v-dialog v-model="promotionStore.createPromotionDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Promotion</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="promotionName" label="Promotion Name" required></v-text-field>
            <v-text-field v-model="promotionType" label="Promotion Type" required></v-text-field>
            <v-text-field v-model="discountValue" label="Discount Value" type="number" required></v-text-field>
            <v-text-field v-model="conditionQuantity" label="Condition Quantity" type="number" required></v-text-field>
            <v-text-field v-model="buyProductId" label="Buy Product ID" type="number"></v-text-field>
            <v-text-field v-model="freeProductId" label="Free Product ID" type="number"></v-text-field>
            <v-text-field v-model="conditionValue1" label="Condition Value 1" type="number"></v-text-field>
            <v-text-field v-model="conditionValue2" label="Condition Value 2" type="number"></v-text-field>
            <v-date-picker v-model="startDate" label="Start Date" required></v-date-picker>
            <v-date-picker v-model="endDate" label="End Date" required></v-date-picker>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1"  @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1"  @click="createPromotion">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { usePromotionStore } from '@/stores/promotion.store';
  
  const promotionStore = usePromotionStore();
  
  const promotionName = ref('');
  const promotionType = ref('');
  const discountValue = ref<number | null>(null);
  const conditionQuantity = ref<number | null>(null);
  const buyProductId = ref<number | null>(null);
  const freeProductId = ref<number | null>(null);
  const conditionValue1 = ref<number | null>(null);
  const conditionValue2 = ref<number | null>(null);
  const startDate = ref('');
  const endDate = ref('');
  
  const closeDialog = () => {
    promotionStore.createPromotionDialog = false;
  };
  
  const createPromotion = async () => {
    if (!promotionName.value || !promotionType.value || !discountValue.value || !conditionQuantity.value || !startDate.value || !endDate.value) {
      return;
    }
  
    const newPromotion = {
      promotionName: promotionName.value,
      promotionType: promotionType.value,
      discountValue: discountValue.value,
      conditionQuantity: conditionQuantity.value,
      buyProductId: buyProductId.value,
      freeProductId: freeProductId.value,
      conditionValue1: conditionValue1.value,
      conditionValue2: conditionValue2.value,
      startDate: new Date(startDate.value),
      endDate: new Date(endDate.value),
    };
    //set to promotionStore.promotion

  
    await promotionStore.createPromotion({
        promotionName: promotionName.value,
        promotionType: promotionType.value,
        discountValue: discountValue.value,
        conditionQuantity: conditionQuantity.value,
        buyProductId: buyProductId.value,
        freeProductId: freeProductId.value,
        conditionValue1: conditionValue1.value,
        conditionValue2: conditionValue2.value,
        startDate: new Date(startDate.value),
        endDate: new Date(endDate.value),
        
    });
    closeDialog();
  };
  </script>
  