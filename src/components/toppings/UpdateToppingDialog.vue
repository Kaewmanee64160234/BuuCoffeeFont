<template>
  <v-dialog v-model="toppingStore.updateToppingDialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">แก้ไขท็อปปิ้ง</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="toppingStore.topping!.toppingName"
                  label="ชื่อท็อปปิ้ง"
                  :rules="[rules.required, rules.name]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="toppingStore.topping!.toppingPrice"
                  label="ราคาท็อปปิ้ง"
                  type="number"
                  :rules="[rules.required, rules.price]"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="toppingStore.updateToppingDialog = false">ปิด</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useToppingStore } from '@/stores/topping.store';
import type { Topping } from '@/types/topping.type';
import Swal from 'sweetalert2';

const toppingStore = useToppingStore();
const form = ref(null);
const valid = ref(false);

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูล',
  name: (value: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(value) || 'ชื่อท็อปปิ้งต้องเป็นตัวอักษรเท่านั้น',
  price: (value: number) => value > 0 || 'ราคาท็อปปิ้งต้องเป็นจำนวนบวก'
};

const submitForm = async () => {
  if (!form.value?.validate()) return;

  const updatedTopping: Topping = {
    toppingId: toppingStore.topping!.toppingId,
    toppingName: toppingStore.topping!.toppingName,
    toppingPrice: toppingStore.topping!.toppingPrice,
  };

  try {
    await toppingStore.updateTopping(updatedTopping.toppingId, updatedTopping);
    toppingStore.updateToppingDialog = false;
    Swal.fire({
      title: 'สำเร็จ',
      text: 'ท็อปปิ้งถูกอัปเดตเรียบร้อยแล้ว!',
      icon: 'success',
      confirmButtonText: 'ตกลง',
      customClass: {
        confirmButton: 'swal-button'
      }
    });
  } catch (error) {
    console.error('Error updating topping:', error);
    Swal.fire({
      title: 'ข้อผิดพลาด',
      text: 'เกิดข้อผิดพลาดขณะอัปเดตท็อปปิ้ง.',
      icon: 'error',
      confirmButtonText: 'ตกลง',
      customClass: {
        confirmButton: 'swal-button'
      }
    });
  }
};
</script>

<style scoped>
.swal-button {
  font-size: 16px;
}
</style>
