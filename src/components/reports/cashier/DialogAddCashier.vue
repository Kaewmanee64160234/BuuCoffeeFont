<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import financeService from '@/service/report/finance.service';
import { useUserStore } from '@/stores/user.store';
const loading = ref(false);
const amounts = ref<number[]>(new Array(9).fill(0));
const valid = ref(false);
const ReportFinnceStore = useReportFinnceStore();
const userStore = useUserStore();
const financeStore = useReportFinnceStore();

const banknotes = [
  { label: 'ธนบัตร 1000 บาท', value: 1000 },
  { label: 'ธนบัตร 500 บาท', value: 500 },
  { label: 'ธนบัตร 100 บาท', value: 100 },
  { label: 'ธนบัตร 50 บาท', value: 50 },
  { label: 'ธนบัตร 20 บาท', value: 20 },
];

const coins = [
  { label: 'เหรียญ 10 บาท', value: 10 },
  { label: 'เหรียญ 5 บาท', value: 5 },
  { label: 'เหรียญ 2 บาท', value: 2 },
  { label: 'เหรียญ 1 บาท', value: 1 },
];

const currencyTypes = [...banknotes, ...coins];

const form = ref<HTMLFormElement | null>(null);

const totalAmount = computed(() => {
  return amounts.value.reduce((sum, amount, index) => {
    return sum + (amount * currencyTypes[index].value);
  }, 0);
});

const cashierAmount = computed(() => {
  return totalAmount.value;
});

const clearData = () => {
  ReportFinnceStore.createCashierDialog = false;
  amounts.value.fill(0); // Reset amounts
};

const submitForm = async () => {
  if (form.value && form.value.validate()) {
    if (cashierAmount.value !== null) {
      const cashier = {
        userId: userStore.getUser().userId,
        type: financeStore.selectedType,
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
      loading.value = true;

      try {


        await financeService.createCashier(cashier, items);
        await financeStore.checkCashierToday();

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
      <v-card-title class="text-h5 bg-brown-lighten-4 pa-4 d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-cash</v-icon>
          บันทึกยอดเงินสดก่อนเปิดการขาย
        </div>
        <v-btn icon @click="ReportFinnceStore.createCashierDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-container>
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">

          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-subtitle-1 bg-grey-lighten-3 pa-3">
              ใส่จำนวนธนบัตร
            </v-card-title>
            <v-card-text class="pt-4">
              <v-row>
                <v-col v-for="(currency, index) in banknotes" :key="currency.value" cols="12" sm="6">
                  <v-text-field v-model="amounts[index]" :label="`${currency.label} (${currency.value} บาท)`"
                    type="number" min="0" @input="amounts[index] = Math.max(0, amounts[index])" suffix="ใบ"
                    variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-subtitle-1 bg-grey-lighten-3 pa-3">
              ใส่จำนวนเหรียญ
            </v-card-title>
            <v-card-text class="pt-4">
              <v-row>
                <v-col v-for="(currency, index) in coins" :key="currency.value" cols="12" sm="6">
                  <v-text-field v-model="amounts[index + banknotes.length]"
                    :label="`${currency.label} (${currency.value} บาท)`" type="number" min="0"
                    @input="amounts[index + banknotes.length] = Math.max(0, amounts[index + banknotes.length])"
                    suffix="เหรียญ" variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-row>
            <v-col cols="12">
              <v-alert v-if="totalAmount > 0" type="info" variant="tonal" class="mb-4">
                ยอดรวมทั้งหมด: {{ totalAmount }} บาท
              </v-alert>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn type="submit" color="#FF9642" size="large" block :loading="loading">
                ส่งข้อมูล
              </v-btn>
            </v-col>
          </v-row>

        </v-form>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dialog-content {
  padding: 20px;
}

.dialog-header {
  background-color: #f5f5f5;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.radio-group {
  margin: 10px 0;
  display: flex;
  justify-content: center;
}

.amount-display {
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.submit-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  min-width: 120px;
}
</style>
