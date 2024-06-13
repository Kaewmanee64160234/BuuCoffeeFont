<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import { createCashier } from '@/service/report/finance.service';

const props = defineProps({
  dialogVisible: Boolean
});

const ReportFinnceStore = useReportFinnceStore();

const cashierAmount = ref<number | null>(null);
const userId = 1; // mock up id

const clearData = () => {
  ReportFinnceStore.createCashierDialog = false;
  cashierAmount.value = null;
};

const submitForm = async () => {
  if (cashierAmount.value !== null) {
    const cashier = {
      cashierAmount: cashierAmount.value,
      user: userId
    };
    await createCashier(cashier);
    clearData();
  }
};

watch(() => props.dialogVisible, (newValue) => {
  ReportFinnceStore.createCashierDialog = newValue;
});
</script>

<template>
  <v-dialog v-model="ReportFinnceStore.createCashierDialog" max-width="500px">
    <v-card>
      <v-card-title>
        Create Cashier
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitForm">
          <v-text-field
            v-model="cashierAmount"
            label="Cashier Amount"
            type="number"
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

