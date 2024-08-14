<template>
  <v-dialog v-model="receiptStore.historyReceiptDialogCatering" max-width="1090px">
    <v-card>
      <!-- Step 1: Show Receipt Items -->
      <v-card-title v-if="!showIngredientStep">
        <!-- First Row: Date and Status -->
        <v-row>
          <v-col cols="6">
            <span>บันทึกการรับรองการจัดเลี้ยง วันที่ {{ formattedReceiptDate }} เวลา {{ formattedReceiptTime }}</span>
          </v-col>
          <v-col cols="6" class="text-right">
            <span v-if="receiptStore.receipt?.receiptStatus === 'cancel'">
              เวลาที่ยกเลิก : {{ receiptStore.receipt?.updatedDate }}
            </span>
          </v-col>
        </v-row>

        <!-- Second Row: Status -->
        <v-row>
          <v-col cols="6">
            <!-- Intentionally left blank -->
          </v-col>
          <v-col cols="6" class="text-right">
            <span>
              สถานะ :
              <template v-if="receiptStore.receipt?.receiptStatus === 'paid'">
                {{ receiptStore.receipt?.receiptStatus }} <v-icon>mdi-check</v-icon>
              </template>
              <template v-if="receiptStore.receipt?.receiptStatus === 'cancel'">
                {{ receiptStore.receipt?.receiptStatus }} <v-icon>mdi-cancel</v-icon>
              </template>
              <template v-if="receiptStore.receipt?.receiptStatus === 'unpaid'">
                รอการดำเนินการ <v-icon color="orange">mdi-clock-outline</v-icon>
              </template>
            </span>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text v-if="!showIngredientStep">
        <v-container>
          <h4>รายการสินค้า</h4>
          <v-table dense>
            <thead>
              <tr>
                <th class="text-center">รายการสินค้า</th>
                <th class="text-center">ระดับความหวาน</th>
                <th class="text-center">ท็อปปิ้ง</th>
                <th class="text-center">จำนวนท็อปปิ้ง</th>
                <th class="text-center">ชนิด</th>
                <th class="text-center">จำนวนต่อหน่วย</th>
                <th class="text-center">ราคา</th>
                <th class="text-center">พนักงานที่ออกใบเสร็จ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!receiptStore.receipt?.receiptItems?.length">
                <td colspan="8" class="text-center">ไม่มีข้อมูล</td>
              </tr>
              <tr v-else v-for="(item, index) in receiptStore.receipt?.receiptItems" :key="index">
                <td class="text-center">{{ item.product?.productName || 'ไม่มีข้อมูล' }}</td>
                <td class="text-center">{{ item.sweetnessLevel ? item.sweetnessLevel + '%' : '0%' }}</td>
                <td class="text-center">
                  <ul>
                    <li v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                      <span v-if="topping.topping?.toppingName">{{ topping.topping.toppingName }}</span>
                      <span v-else>-</span>
                    </li>
                    <li v-if="item.productTypeToppings.length === 0">-</li>
                  </ul>
                </td>
                <td class="text-center">
                  <ul>
                    <li v-for="(topping, idx) in item.productTypeToppings" :key="idx">
                      {{ topping.quantity || '0' }}
                    </li>
                    <li v-if="item.productTypeToppings.length === 0">0</li>
                  </ul>
                </td>
                <td class="text-center">
                  <span v-if="item.productType?.productTypeName">{{ item.productType.productTypeName }}</span>
                  <span v-else>ไม่มีข้อมูล</span>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-center">{{ item.receiptSubTotal }}</td>
                <td class="text-center">{{ receiptStore.receipt?.user?.userName || '-' }}</td>
              </tr>
            </tbody>
          </v-table>

          <div class="text-right" style="margin-top: 20px;">
            <strong>ราคารวมสุทธิ:</strong>
            <span>{{ receiptStore.receipt?.receiptNetPrice || 0 }} บาท</span>
          </div>

          <div class="text-right" style="margin-top: 10px;">
            <strong>จำนวนเงินที่ได้รับ:</strong>
            <span>{{ receiptStore.receipt?.receive || 0 }} บาท</span>
          </div>

          <div class="text-right" style="margin-top: 10px;">
            <strong>เงินทอน:</strong>
            <span>{{ receiptStore.receipt?.change || 0 }} บาท</span>
          </div>

          <!-- Next Button to show ingredient check -->
          <v-btn color="orange" @click="showNextStep">
            ถัดไป
          </v-btn>
        </v-container>
      </v-card-text>

      <!-- Step 2: Show Ingredient Check -->
    

      <v-card-text v-if="showIngredientStep">
        <v-card>
          <v-card-title>
            <v-row justify="center" align="center">
              <v-icon color="primary" style="font-size: 30px;">mdi-calendar-month</v-icon>
              <strong style="font-size: 18px; margin-left: 8px;">รายละเอียดใบเช็ควัตถุดิบ วันที่ : {{
                formatDate(ingredientStore.checkingredient?.date) }}</strong>
            </v-row>

            <v-row>
              <v-col style="padding-top: 4px;">
                <v-icon color="primary" left style="font-size: 20px;">mdi-clipboard-text</v-icon>
                <strong style="font-size: 16px;"> รูปแบบ : </strong>
                <span style="font-size: 14px;">
                  {{ ingredientStore.checkingredient?.actionType === 'issuing' ? 'นำวัตถุดิบออก' : (
                    ingredientStore.checkingredient?.actionType === 'check' ? 'เช็ควัตถุดิบ' : 'เลี้ยงรับรอง') }}
                </span>
              </v-col>

              <v-col style="padding-top: 4px;">
                <v-icon color="primary" left style="font-size: 20px;">mdi-account-outline</v-icon>
                <strong style="font-size: 16px;"> ผู้รับผิดชอบ : </strong>
                <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.user.userName }}</span>
              </v-col>
            </v-row>

            <v-row>
              <v-col style="padding-top: 4px;">
                <v-icon color="primary" left style="font-size: 20px;">mdi-text</v-icon>
                <strong style="font-size: 16px;"> รายละเอียด : </strong>
                <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.checkDescription }}</span>
              </v-col>
            </v-row>

          </v-card-title>

          <v-divider></v-divider>

          <v-table class="text-center mt-5">
            <thead>
              <tr>
                <th class="column-header text-center">ลำดับ</th>
                <th class="column-header text-center">ชื่อวัตถุดิบ</th>
                <th class="column-header text-center">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!ingredientStore.checkingredient?.checkingredientitem?.length">
                <td colspan="3" class="text-center">ไม่มีข้อมูล</td>
              </tr>
              <tr v-else v-for="(item, index) in ingredientStore.checkingredient?.checkingredientitem"
                :key="item.CheckIngredientsItemID">
                <th class="column-header text-center">{{ index + 1 }}</th>
                <td>{{ item.ingredient.ingredientName }}</td>
                <td>{{ item.UsedQuantity }} {{ item.ingredient.ingredientUnit }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-btn v-if="showIngredientStep" color="secondary" @click="showPreviousStep">ย้อนกลับ</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>




<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useReceiptStore } from '@/stores/receipt.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';

const ingredientStore = useCheckIngredientStore();



const receiptStore = useReceiptStore();
const showIngredientStep = ref(false);

function showNextStep() {
  showIngredientStep.value = true;
}

function showPreviousStep() {
  showIngredientStep.value = false;
}

function closeDialog() {
  receiptStore.receipt = null;
  receiptStore.historyReceiptDialogCatering = false;
  showIngredientStep.value = false;
}
const formatDate = (date: any) => {
  if (!date) return ''; // Handle case where date is not provided

  const jsDate = new Date(date.toString()); // Convert date to string and create Date object
  const formattedDate = jsDate.toLocaleDateString('th-TH', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    timeZone: 'Asia/Bangkok' 
  }); // Format the date in the desired format
  
  const formattedTime = jsDate.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  }); // Format the time in the desired format
  
  return `${formattedDate} เวลา ${formattedTime}`; // Combine date and time
};
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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

const formattedReceiptDate = computed(() => {
  return receiptStore.receipt ? formatDateThai(new Date(receiptStore.receipt.createdDate).toISOString()) : '';
});

const formattedReceiptTime = computed(() => {
  return receiptStore.receipt ? formatTime(new Date(receiptStore.receipt.createdDate).toISOString()) : '';
});
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
