<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          บันทึกการสั่งซื้อ วันที่ {{ formattedReceiptDate }}<br> ลูกค้า : {{ customerName }}
        </span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-table dense>
            <thead>
              <tr>
                <th class="text-center">รายการสินค้า</th>
                <th class="text-center">ท็อปปิ้ง</th>
                <th class="text-center">ชนิด</th>
                <th class="text-center">จำนวนต่อหน่วย</th>
                <th class="text-center">ราคา</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in receiptItems" :key="index">
                <td class="text-center">{{ item.product?.productName || 'ไม่มีข้อมูล' }}</td>
                <td class="text-center">
                  <ul>
                    <li v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                      {{ topping.topping?.toppingName || 'ไม่มีข้อมูล' }}
                    </li>
                  </ul>
                </td>
                <td class="text-center">{{ item.productType?.productTypeName}}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-center">{{ item.receiptSubTotal }}</td>
              </tr>
            </tbody>
          </v-table>
          <div class="text-right" style="margin-top: 20px;">
            <strong>ราคารวมสุทธิ</strong>
            <span>{{ receipt?.receiptTotalPrice ?? 0 }} บาท</span>
          </div>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange" @click="dialog = false">ตกลง</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import type { Receipt } from '@/types/receipt.type';

const props = defineProps<{ dialog: boolean, receipt: Receipt | null }>();
const dialog = ref(props.dialog);

function formatDateThai(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert AD to BE
  return `${day} ${month} พ.ศ.${year}`;
}

const formattedReceiptDate = computed(() => {
  return props.receipt ? formatDateThai(new Date(props.receipt.createdDate).toISOString()) : '';
});

const customerName = computed(() => props.receipt?.customer?.customerName || '');
const receiptItems = computed(() => props.receipt?.receiptItems || []);

watch(() => props.dialog, (newVal) => {
  dialog.value = newVal;
});
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
