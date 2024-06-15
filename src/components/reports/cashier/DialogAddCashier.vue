<script lang="ts" setup>
import { ref } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import { createCashier } from '@/service/report/finance.service';

const ReportFinnceStore = useReportFinnceStore();

const cashierAmount = ref<number | null>(null);
const userId = 1; // mock up id

const form = ref<HTMLFormElement | null>(null); // Reference to the form

const clearData = () => {
  ReportFinnceStore.createCashierDialog = false;
  cashierAmount.value = null;
};

const submitForm = async () => {
  if (form.value && form.value.validate()) {
    if (cashierAmount.value !== null) {
      const cashier = {
        cashierAmount: cashierAmount.value,
        user: userId,
      };
      await createCashier(cashier);
      clearData();
    }
  }
};

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูลเป็นตัวเลข.',
};
</script>

<template>
  <v-dialog v-model="ReportFinnceStore.createCashierDialog" max-width="500px">
    <v-card>
      <v-card-title>Create Cashier</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <v-text-field
            v-model="cashierAmount"
            label="Cashier Amount"
            type="number"
            :rules="[rules.required, rules.min]"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="submitForm">Submit</v-btn>
        <v-btn @click="clearData">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Add any scoped styles here */
</style>
