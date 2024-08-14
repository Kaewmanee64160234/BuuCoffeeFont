<template>
  <v-dialog v-model="toppingStore.createToppingDialog" persistent max-width="600px" @click:outside="resetForm">
    <v-card>
      <v-card-title>
        <span class="headline">สร้างท็อปปิ้ง</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="toppingName"
                  label="ชื่อท็อปปิ้ง"
                  :rules="[rules.required, rules.name]"
                  variant="solo"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="toppingPrice"
                  label="ราคาท็อปปิ้ง"
                  type="number"
                  :rules="[rules.required, rules.price]"
                  variant="solo"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="closeDialog">ปิด</v-btn>
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
import type { VForm } from 'vuetify/components';

const toppingStore = useToppingStore();
const form = ref<VForm | null>(null);
const valid = ref(false);
const toppingName = ref('');
const toppingPrice = ref(0);

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูล',
  name: (value: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(value) || 'ชื่อท็อปปิ้งต้องเป็นตัวอักษรเท่านั้น',
  price: (value: number) => value > 0 || 'ราคาท็อปปิ้งต้องเป็นจำนวนบวก'
};

const resetForm = () => {
  toppingName.value = '';
  toppingPrice.value = 0;
  if (form.value) {
    form.value.reset();
    form.value.resetValidation();
  }
  valid.value = false;
};

const closeDialog = () => {
  toppingStore.createToppingDialog = false;
  resetForm();
};

const submitForm = async () => {
  if (form.value) {
    const isValid = await form.value.validate();
    if (isValid) {
      const newTopping: Topping = {
        toppingId: 0,
        toppingName: toppingName.value,
        toppingPrice: toppingPrice.value,
      };

      try {
        await toppingStore.createTopping(newTopping);
        toppingStore.createToppingDialog = false;
        Swal.fire({
          title: 'สำเร็จ',
          text: 'ท็อปปิ้งถูกสร้างเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          customClass: {
            confirmButton: 'swal-button'
          }
        });
        resetForm();
      } catch (error) {
        console.error('Error creating topping:', error);
        Swal.fire({
          title: 'ข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดขณะสร้างท็อปปิ้ง.',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          customClass: {
            confirmButton: 'swal-button'
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.swal-button {
  font-size: 16px;
}
</style>
