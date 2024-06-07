<template>
    <v-container>
      <v-card>
        <v-card-title>
          <v-row>
            <v-col cols="9">
              Categories
            </v-col>
            <v-col cols="3">
              <v-text-field v-model="categoryStore.searchQuery" label="Search" append-inner-icon="mdi-magnify" hide-details dense></v-text-field>
            </v-col>
            <v-col>
              <v-btn @click="openCreateDialog" color="success">
                <v-icon left>mdi-plus</v-icon>
                Add New Category
              </v-btn>
            </v-col>
          </v-row>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th style="text-align: center;">Category ID</th>
              <th style="text-align: center;">Category Name</th>
              <th style="text-align: center;">Have Topping</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categoryStore.categories" :key="category.categoryId">
              <td>{{ category.categoryId }}</td>
              <td>{{ category.categoryName }}</td>
              <td>{{ category.haveTopping ? 'มี' : 'ไม่มี' }}</td>
              <td>
                <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil" @click="openUpdateDialog(category)"></v-btn>
                <v-btn color="#F55050" class="mr-5" icon="mdi-delete" @click="deleteCategory(category.categoryId)"></v-btn>
              </td>
            </tr>
          </tbody>
          </v-table>
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
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });
  
      if (result.isConfirmed) {
        await categoryStore.deleteCategory(categoryId);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      Swal.fire('Error', 'An error occurred while deleting the category.', 'error');
    }
  };
  </script>
  