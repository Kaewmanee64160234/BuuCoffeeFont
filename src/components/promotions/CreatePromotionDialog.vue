<template>
    <v-dialog v-model="promotionStore.createPromotionDialog" max-width="600px">
        <v-card>
            <v-card-title>
                <span class="headline">Create Promotion</span>
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
                            <v-text-field v-if="!noEndDate" v-model="endDate" label="End Date"
                                type="date"></v-text-field>
                            <v-select v-model="promotionType"
                                :items="promotionTypes.map(promotionType => promotionType.value)" item-text="text"
                                item-value="value" label="Promotion Type" required></v-select>
                            <v-textarea v-model="description" label="Description" required></v-textarea>
                        </v-form>
                    </template>

                    <template v-slot:item.2>
                        <h3 class="text-h6">Promotion Type Details</h3>
                        <br>
                        <v-form ref="form2">
                            <template v-if="promotionType === 'discountPrice'">
                                <v-text-field v-model="discountValue" label="Discount Value" type="number"
                                    required></v-text-field>
                            </template>
                            <template v-if="promotionType === 'buy1get1'">
                                <v-autocomplete v-model="buyProductId"
                                    :items="productStore.products.map(product => product.productName)"
                                    item-text="productName" item-value="id" label="Buy Product"
                                    required></v-autocomplete>
                                <v-autocomplete v-model="freeProductId"
                                    :items="productStore.products.map(product => product.productName)"
                                    item-text="productName" item-value="id" label="Free Product"
                                    required></v-autocomplete>
                            </template>
                            <template v-if="promotionType === 'usePoints'">
                                <v-text-field v-model="pointsRequired" label="Points Required" type="number"
                                    required></v-text-field>
                                <v-text-field v-model="discountValue" label="Discount Value" type="number"
                                    required></v-text-field>
                            </template>
                            <template v-if="promotionType === 'discountPercentage'">
                                <v-text-field v-model="discountPercentage" label="Discount Percentage" type="number"
                                    required></v-text-field>
                                <v-text-field v-model="minimumPrice" label="Minimum Price for Discount" type="number"
                                    required></v-text-field>
                            </template>
                        </v-form>
                    </template>
                </v-stepper>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="step > 1" @click="previousStep">Back</v-btn>
                <v-btn v-if="step < items.length" @click="nextStep">Next</v-btn>
                <v-btn v-if="step === items.length" @click="createPromotion">Create</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { usePromotionStore } from '@/stores/promotion.store';
import { useProductStore } from '@/stores/product.store';
import type { Promotion } from '@/types/promotion.type';

const promotionStore = usePromotionStore();
const productStore = useProductStore();

const step = ref(1);
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

const nextStep = () => {
    step.value++;
};

const previousStep = () => {
    step.value--;
};

const closeDialog = () => {
    // clear all data
    promotionName.value = '';
    promotionType.value = '';
    discountValue.value = null;
    buyProductId.value = null;
    freeProductId.value = null;
    pointsRequired.value = null;
    step.value = 1;
    promotionStore.createPromotionDialog = false;
};

const createPromotion = async () => {
    if (!promotionName.value || !promotionType.value || !startDate.value || (!noEndDate.value && !endDate.value)) {
        return;
    }

    const newPromotion: Promotion = {
        promotionId: 0, // This will be set by the backend
        promotionName: promotionName.value,
        promotionType: promotionType.value,
        startDate: new Date(startDate.value),
        endDate: noEndDate.value ? null : new Date(endDate.value),
        discountValue: promotionType.value === 'discountPrice' || promotionType.value === 'usePoints' ? discountValue.value : null,
        conditionQuantity: promotionType.value === 'discountPrice' || promotionType.value === 'usePoints' ? 1 : null,
        buyProductId: promotionType.value === 'buy1get1' ? productStore.products.find(product => product.productName === buyProductId.value)?.productId : null, // Find the product id from the product store (assuming the product store has the products loaded
        freeProductId: promotionType.value === 'buy1get1' ? productStore.products.find(product => product.productName === freeProductId.value)?.productId : null,
        conditionValue1: promotionType.value === 'discountPercentage' ? discountPercentage.value : null,
        conditionValue2: promotionType.value === 'discountPercentage' ? minimumPrice.value : null,
        promotionDescription: description.value,
        noEndDate: noEndDate.value,
    };

    await promotionStore.createPromotion(newPromotion);
    closeDialog();
};
</script>