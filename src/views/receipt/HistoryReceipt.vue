<script lang="ts" setup>
  import { useReceiptStore } from '@/stores/receipt.store';
  import { computed, onMounted, ref, watch } from 'vue';
  import type { Receipt } from '@/types/receipt.type';
  import HistoryReceiptDialog from '@/components/receipts/HistoryReceiptDialog.vue';
  
  const receiptStore = useReceiptStore();
  const historyReceiptDialog = ref(false);
  
  onMounted(async () => {
    await receiptStore.getAllReceipts();
  });
 
  
  const openEditreceiptDialog = (receipt: Receipt) => {
    receiptStore.historyReceiptDialog = true;
  };
  </script>

<template>
    <HistoryReceiptDialog v-model:dialog="receiptStore.historyReceiptDialog" :receipt="receiptStore.receipt"></HistoryReceiptDialog>
  
    <v-container>
      <v-card class="flex-container">
        <v-card-title>
          <v-row>
            <v-col cols="9" style="font-size: 35px;">
              ประวัติการสั่งซื้อ
            </v-col>
            <v-row style="margin-left: 6%;">
              <v-col class="pa-2 ma-2" cols="3">
                <v-text-field
                  v-model="receiptStore.searchQuery"
                  label="ค้นหาคำสั่งซื้อ"
                  append-inner-icon="mdi-magnify"
                  hide-details
                  dense
                ></v-text-field>
              </v-col>
              
            </v-row>
          </v-row>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
          <v-table class="text-center">
            <thead>
              <tr>
                <th class="text-center"></th>
                <th class="text-center">วันที่</th>
                <th class="text-center">ส่วนลด</th>
                <th class="text-center">สมาชิก</th>
                <th class="text-center">โปรโมชั่น</th>
                <th class="text-center">ราคารวมสุทธิ</th>
                <th class="text-center">รูปแบบการจ่ายเงิน</th>
                <th class="text-center">สถานะการจ่ายเงิน</th>
                <th class="text-center">Operations</th>
              </tr>
            </thead>
            <tbody>
              <!-- <tr v-for="(item, index) in filterReceipts" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="text-center">{{ item.createdReceipt }}</td>
                <td class="text-center">{{ item.totalDiscount }}</td>
                <td class="text-center">{{ item.customerId.customerName }}</td>
                <td class="text-center">{{ item.promotion }}</td>
                <td class="text-center">{{ item.netPrice }}</td>
                <td class="text-center">{{ item.receiptType }}</td>
                <td class="text-center">{{ item.receiptStatus }}</td>
                <td class="text-center">
                  <v-btn color="#FFDD83" icon="mdi-eye" @click="openEditreceiptDialog(item)"></v-btn>
                </td>
              </tr> -->
              <tr v-for="(item, index) in receiptStore.receipts" :key="index">
                <td class="text-center">1</td>
                <td class="text-center">30 เมษายน พ.ศ.2567</td>
                <td class="text-center">5.00</td>
                <td class="text-center">พรชิตา ซาไซย์</td>
                <td class="text-center">-</td>
                <td class="text-center">35.00</td>
                <td class="text-center">เงินสด</td>
                <td class="text-center">สำเร็จแล้ว</td>
                <td class="text-center">
                  <v-btn color="#FFDD83" icon="mdi-eye" @click="openEditreceiptDialog(item)"></v-btn>
                </td>
              </tr>
            </tbody>
            <!-- <tbody v-if="!filterReceipts.length">
              <tr>
                <td colspan="9" class="text-center">No data</td>
              </tr>
            </tbody> -->
          </v-table>
        </v-card>
      </v-card>
    </v-container>
  </template>
  
  <style>
  .flex-container {
    display: flex;
    flex-direction: column;
    height: 95vh;
  }
  </style>
  