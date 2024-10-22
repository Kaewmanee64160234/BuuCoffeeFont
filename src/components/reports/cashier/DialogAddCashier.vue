<script lang="ts" setup>
import { ref } from 'vue';
import { useReportFinnceStore } from '@/stores/report/finance.store';
import { createCashier } from '@/service/report/finance.service';

const ReportFinnceStore = useReportFinnceStore();

const cashierAmount = ref<number | null>(null);
const userId = 1;

const form = ref<HTMLFormElement | null>(null);

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
      <v-card-title>บันทึกยอดเงินสดประจำวัน</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <v-row v-if="!cashierAmount || cashierAmount <= 0">
              <v-col cols="12">
                <v-alert type="warning" border="left" color="warning" elevation="2">
                  กรุณากรอกข้อมูล [ จำนวนเงินสด ]
                </v-alert>
              </v-col>
            </v-row>
          <v-row>
           
            <v-col cols="10">
              <v-text-field
                v-model="cashierAmount"
                label="จำนวนเงินสด"
                :rules="[rules.required]"
                type="number"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="2" class="d-flex align-center">
              <span>บาท</span>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="clearData">ปิด</v-btn>
        <v-btn :disabled="!cashierAmount || cashierAmount <= 0" @click="submitForm">บันทึก</v-btn>
      </v-card-actions>
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
