<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import financeService from '@/service/report/finance.service';

const amounts = ref<number[]>(new Array(9).fill(0));
const valid = ref(false);
const ReportFinnceStore = useReportFinnceStore();
const cashierAmount = ref<number | null>(null);
const userId = 1;
const selectedType = ref<string | null>(null);

const currencyTypes = [
  { label: 'ธนบัตร 1000 บาท', value: 1000 },
  { label: 'ธนบัตร 500 บาท', value: 500 },
  { label: 'ธนบัตร 100 บาท', value: 100 },
  { label: 'ธนบัตร 50 บาท', value: 50 },
  { label: 'ธนบัตร 20 บาท', value: 20 },
  { label: 'เหรียญ 10 บาท', value: 10 },
  { label: 'เหรียญ 5 บาท', value: 5 },
  { label: 'เหรียญ 2 บาท', value: 2 },
  { label: 'เหรียญ 1 บาท', value: 1 },
];


const form = ref<HTMLFormElement | null>(null);

const totalAmount = computed(() => {
  return amounts.value.reduce((sum, amount, index) => {
    return sum + (amount * currencyTypes[index].value);
  }, 0);
});

const clearData = () => {
  ReportFinnceStore.createCashierDialog = false;
  cashierAmount.value = null;
  amounts.value.fill(0); // Reset amounts
};

const submitForm = async () => {
  if (form.value && form.value.validate()) {
    if (cashierAmount.value !== null) {
      const cashier = {
        cashierAmount: cashierAmount.value,
        user: userId,
        type: selectedType.value,
      };

      const items = [
  { denomination: "1000", quantity: amounts.value[0] },
  { denomination: "500", quantity: amounts.value[1] },
  { denomination: "100", quantity: amounts.value[2] },
  { denomination: "50", quantity: amounts.value[3] },
  { denomination: "20", quantity: amounts.value[4] },
  { denomination: "10", quantity: amounts.value[5] },
  { denomination: "5", quantity: amounts.value[6] },
  { denomination: "2", quantity: amounts.value[7] },
  { denomination: "1", quantity: amounts.value[8] },
];


      try {

        await financeService.createCloseCashier(cashier, items);
        console.log(cashier); 
        clearData();
      } catch (error) {
        console.error('Error creating cashier:', error);
      }
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
      <v-card-title>ปิดการขาย</v-card-title>
      <v-row>
  <v-col cols="12">
    <v-radio-group v-model="selectedType" row>
      <v-radio label="Coffee" value="coffee"></v-radio>
      <v-radio label="Rice" value="rice"></v-radio>
    </v-radio-group>
  </v-col>
</v-row>

      <v-container>
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="cashierAmount"
                label="จำนวนเงิน"
                type="number"
                :rules="[rules.required]"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              v-for="(currency, index) in currencyTypes"
              :key="currency.value"
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="amounts[index]"
                :label="currency.label"
                type="number"
                min="0"
                @input="amounts[index] = Math.max(0, amounts[index])" 
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-btn type="submit" color="primary">ส่งข้อมูล</v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-alert
                v-if="totalAmount > 0"
                type="info"
                dismissible
              >
                ยอดรวม: {{ totalAmount }}
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card>
  </v-dialog>
</template>



<style scoped>
.v-table-container {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.v-table {
  table-layout: fixed;
  width: 100%;
}

.v-table th,
.v-table td {
  width: 25%;
}

.v-card-title {
  background-color: #f5f5f5;
  padding: 16px;
}
</style>
