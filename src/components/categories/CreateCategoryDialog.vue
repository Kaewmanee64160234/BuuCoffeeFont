<template>
    <v-dialog v-model="categoryStore.createCategoryDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Category</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12">
                  <v-text-field  variant="solo" v-model="categoryName" label="Category Name" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-checkbox v-model="haveTopping" label="Have Topping"></v-checkbox>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="categoryStore.createCategoryDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { useCategoryStore } from '@/stores/category.store';
  import type { Category } from '@/types/category.type';
import Swal from 'sweetalert2';
  
  const categoryStore = useCategoryStore();
  const form = ref(null);
  const valid = ref(false);
  const categoryName = ref('');
  const haveTopping = ref(false);
  
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
      Swal.fire('Success', 'Category created successfully!', 'success');
    } catch (error) {
      console.error('Error creating category:', error);
      Swal.fire('Error', 'An error occurred while creating the category.', 'error');
    }
  };
  </script>
  