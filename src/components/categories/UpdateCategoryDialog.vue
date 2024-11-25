<template>
  <v-dialog v-model="categoryStore.updateCategoryDialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">แก้ไขหมวดหมู่</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field variant="solo" v-model="categoryName" label="ชื่อหมวดหมู่" :rules="[rules.required, rules.categoryName]" required></v-text-field>
              </v-col>
             
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="categoryStore.updateCategoryDialog = false" style="font-size: 16px;">ปิด</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid" style="font-size: 16px;">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useCategoryStore } from '@/stores/category.store';
import type { Category } from '@/types/category.type';
import Swal from 'sweetalert2';

const categoryStore = useCategoryStore();
const form = ref(null);
const valid = ref(false);
const categoryName = ref('');
const haveTopping = ref(false);

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูล',
  categoryName: (value: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(value) || 'ชื่อหมวดหมู่ต้องไม่มีตัวเลขหรืออักขระพิเศษ',
};

watch(() => categoryStore.category, (newVal) => {
    if (newVal) {
        categoryName.value = newVal.categoryName;
    }
}, { immediate: true });

const submitForm = async () => {
    if (!form.value?.validate()) return;

    const updatedCategory: Category = {
        categoryId: categoryStore.category?.categoryId || 0,
        categoryName: categoryName.value,
    };

    try {
        await categoryStore.updateCategory(updatedCategory.categoryId, updatedCategory);
        categoryStore.updateCategoryDialog = false;
        Swal.fire({
          title: 'สำเร็จ',
          text: 'หมวดหมู่ถูกแก้ไขเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
    } catch (error) {
        console.error('Error updating category:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดขณะแก้ไขหมวดหมู่.',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
    }
};
</script>

<style scoped>
</style>
