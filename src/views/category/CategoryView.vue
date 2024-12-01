<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row style="padding: 20px;">
          <h3>หมวดหมู่</h3>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="3">
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
          <v-col cols="12" sm="6" md="3" class="d-flex justify-center align-center">
            <v-btn @click="openCreateDialog" color="success" style="font-size: 16px;">
              <v-icon left>mdi-plus</v-icon>
              เพิ่มหมวดหมู่
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-responsive>
          <v-table class="text-center mt-5" style="width: 97%;">
            <thead>
              <tr>
                <th style="text-align: center; font-weight: bold;font-size: 16px;">รหัสหมวดหมู่</th>
                <th style="text-align: center; font-weight: bold;font-size: 16px;">ชื่อหมวดหมู่</th>
                <th style="text-align: center; font-weight: bold;font-size: 16px;">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(category, index) in filteredCategories" :key="index" style="text-align: center;">
                <td style="font-size: 16px;">{{ index + 1 + (categoryStore.currentPage - 1) * categoryStore.itemsPerPage }}</td>
                <td style="font-size: 16px;">{{ category.categoryName }}</td>
                <td style="font-size: 16px;">
                  <template v-if="category.categoryName !== 'กาแฟ' && category.categoryName !== 'กับข้าว'">
                    <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openUpdateDialog(category)">
                    </v-btn>
                    <v-btn color="#F55050" icon="mdi-delete" @click="deleteCategory(category.categoryId)">
                    </v-btn>
                  </template>
                </td>
              </tr>
            </tbody>
            <tbody v-if="!filteredCategories.length">
              <tr>
                <td colspan="4" class="text-center" style="font-size: 16px;">ไม่มีข้อมูล</td>
              </tr>
            </tbody>
          </v-table>
        </v-responsive>
      </v-card-text>
      <v-pagination
        justify="center"
        v-model="categoryStore.currentPage"
        :length="Math.ceil(categoryStore.totalCategories / categoryStore.itemsPerPage)"
        rounded="circle"
      ></v-pagination>
    </v-card>
    <CreateCategoryDialog />
    <UpdateCategoryDialog />
  </v-container>
</template>

<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { computed, onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import CreateCategoryDialog from '@/components/categories/CreateCategoryDialog.vue';
import UpdateCategoryDialog from '@/components/categories/UpdateCategoryDialog.vue';
import type { Category } from '@/types/category.type';

const categoryStore = useCategoryStore();

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
      Swal.fire({
        title: 'ลบเสร็จสิ้น!',
        text: 'หมวดหมู่ถูกลบเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบหมวดหมู่.', 'error');
  }
};

const filteredCategories = computed(() => {
  let filtered = categoryStore.categoriesForCreate;

  if (categoryStore.searchQuery) {
    filtered = filtered.filter(category =>
      category.categoryName.toLowerCase().includes(categoryStore.searchQuery.toLowerCase())
    );
  }

  const start = (categoryStore.currentPage - 1) * categoryStore.itemsPerPage;
  const end = start + categoryStore.itemsPerPage;

  return filtered.slice(start, end);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}

.button-full-width {
  width: 100%;
}

th,
td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  text-align: center !important;
}

@media (max-width: 768px) {
  .fit-content {
    width: 100%;
    overflow-x: auto;
  }

  v-table {
    font-size: 0.8rem;
  }

  v-btn {
    min-width: 32px;
    height: 32px;
  }

  h3 {
    font-size: 1.2rem;
  }
}
</style>
