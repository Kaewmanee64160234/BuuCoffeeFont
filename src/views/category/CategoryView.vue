<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row style="padding: 20px;">
          <h3>ประเภทสินค้า</h3>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field 
              v-model="categoryStore.searchQuery" 
              label="ค้นหาหมวดหมู่" 
              append-inner-icon="mdi-magnify"
              hide-details 
              dense 
              variant="solo"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="3" class="d-flex justify-center align-center">
            <v-btn @click="openCreateDialog" style="background-color: #8ad879; color: white" block>
              <v-icon left>mdi-plus</v-icon>
              เพิ่มหมวดหมู่
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th style="text-align: center;font-weight: bold;"></th>
              <th style="text-align: center;font-weight: bold;">ชื่อประเภทสินค้า</th>
              <th style="text-align: center;font-weight: bold;">ประเภทสินค้านี้สามารถใส่ท็อปปิ้งได้</th>
              <th style="text-align: center;font-weight: bold;">การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categoryStore.categories" :key="category.categoryId" style="text-align: center;">
              <td>{{ category.categoryId }}</td>
              <td>{{ category.categoryName }}</td>
              <td>{{ category.haveTopping ? 'ได้' : 'ไม่ได้' }}</td>
              <td>
                <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openUpdateDialog(category)">
                </v-btn>
                <v-btn color="#F55050" icon="mdi-delete" @click="deleteCategory(category.categoryId)">
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!categoryStore.categories || categoryStore.categories.length === 0">
            <tr>
              <td colspan="4" class="text-center">ไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
    <CreateCategoryDialog />
    <UpdateCategoryDialog />
  </v-container>
</template>

<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import CreateCategoryDialog from '@/components/categories/CreateCategoryDialog.vue';
import UpdateCategoryDialog from '@/components/categories/UpdateCategoryDialog.vue';
import type { Category } from '@/types/category.type';

const categoryStore = useCategoryStore();

const headers = ref([
  { text: 'Category ID', value: 'categoryId' },
  { text: 'Category Name', value: 'categoryName' },
  { text: 'Have Topping', value: 'haveTopping' },
  { text: 'Actions', value: 'actions', sortable: false },
]);

onMounted(async () => {
  await categoryStore.getAllCategories();
});

const openCreateDialog = () => {
  categoryStore.category = null;
  categoryStore.createCategoryDialog = true;
};

const openUpdateDialog = (category: Category) => {
  categoryStore.category = { ...category };
  categoryStore.updateCategoryDialog = true;
};

const deleteCategory = async (categoryId: number) => {
  try {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบหมวดหมู่นี้หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await categoryStore.deleteCategory(categoryId);
      Swal.fire('ลบแล้ว!', 'หมวดหมู่ถูกลบเรียบร้อยแล้ว.', 'success');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบหมวดหมู่.', 'error');
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

.button-full-width {
  width: 100%;
}
th, td {
  padding-top: 12px !important; 
  padding-bottom: 12px !important; 
  text-align: center !important; 
}
</style>
