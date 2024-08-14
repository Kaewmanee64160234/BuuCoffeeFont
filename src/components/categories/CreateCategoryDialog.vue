<template>
  <v-dialog v-model="categoryStore.createCategoryDialog" persistent max-width="600px" @click:outside="resetForm">
    <v-card>
      <v-card-title>
        <span class="headline">สร้างหมวดหมู่</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row v-if="!categoryName ">
              <v-col cols="12">
                <v-alert type="warning" border="left" color="warning" elevation="2">
                  กรุณากรอกข้อมูล [ ชื่อหมวดหมู่ ] 
                </v-alert>
              </v-col>
            </v-row>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field variant="solo" v-model="categoryName" label="ชื่อหมวดหมู่" :rules="[rules.required, rules.categoryName]" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="haveTopping" label="มีท็อปปิ้ง"></v-checkbox>
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
import { useCategoryStore } from '@/stores/category.store';
import type { Category } from '@/types/category.type';
import Swal from 'sweetalert2';
import type { VForm } from 'vuetify/components';

const categoryStore = useCategoryStore();
const form = ref<VForm | null>(null);
const valid = ref(false);
const categoryName = ref('');
const haveTopping = ref(false);

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูล',
  categoryName: (value: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(value) || 'ชื่อหมวดหมู่ต้องไม่มีตัวเลขหรืออักขระพิเศษ',
};

const resetForm = () => {
  if (form.value) {
    form.value.reset();
    form.value.resetValidation();
  }
  categoryName.value = '';
  haveTopping.value = false;
  valid.value = false;
};

const closeDialog = () => {
  categoryStore.createCategoryDialog = false;
  resetForm();
};

const submitForm = async () => {
  if (!form.value?.validate()) return;

  const newCategory: Category = {
    categoryId: 0,
    categoryName: categoryName.value,
    haveTopping: haveTopping.value,
  };

  try {
    await categoryStore.createCategory(newCategory);
    categoryStore.createCategoryDialog = false;
    Swal.fire({
      title: 'สำเร็จ',
      text: 'สร้างหมวดหมู่เรียบร้อยแล้ว!',
      icon: 'success',
      confirmButtonText: 'ตกลง',
      customClass: {
        confirmButton: 'swal-button'
      }
    });
    resetForm();
  } catch (error) {
    console.error('Error creating category:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'เกิดข้อผิดพลาดขณะสร้างหมวดหมู่.',
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
