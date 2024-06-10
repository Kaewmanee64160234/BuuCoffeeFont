<template>
    <v-dialog v-model="dialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            บันทึกการสั่งซื้อ วันที่ {{ receiptDate }}<br> ลูกค้า : {{ customerName }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-table dense>
              <thead>
                <tr>
                  <th>รายการสินค้า</th>
                  <th>ท็อปปิ้ง</th>
                  <th>ชนิด</th>
                  <th>จำนวนต่อหน่วย</th>
                  <th>ราคา</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in receiptItems" :key="index">
                  <td>{{ item.productName }}</td>
                  <td>{{ item.topping }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.price }}</td>
                </tr>
              </tbody>
            </v-table>
            <div class="text-right" style="margin-top: 20px;">
              <strong>ราคารวมสุทธิ</strong>
              <span>{{ totalPrice }} บาท</span>
            </div>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="orange" @click="closeDialog">ตกลง</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { useReceiptStore } from '@/stores/receipt.store';
  import type { Receipt } from '@/types/receipt.type'; // Ensure these types are correctly defined and imported

  
  const props = defineProps<{ dialog: boolean, receipt: Receipt | null }>();
  const emit = defineEmits<{ (e: 'update:dialog', value: boolean): void }>();
  
  const dialog = ref(props.dialog);
  const receiptDate = computed(() => props.receipt?.createdReceipt || '');
  const customerName = computed(() => props.receipt?.customerId?.customerName || '');
  const receiptItems = computed(() => props.receipt?.items || []);
  const totalPrice = computed(() => receiptItems.value.reduce((acc, item) => acc + item.price, 0));
  
  watch(() => props.dialog, (newVal) => {
    dialog.value = newVal;
  });
  
  function closeDialog() {
    emit('update:dialog', false);
  }
  </script>
  
  <style scoped>
  .text-right {
    text-align: right;
  }
  </style>
  