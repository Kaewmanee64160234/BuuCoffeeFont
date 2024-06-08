<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { computed, onMounted, ref, watch } from 'vue';
// import AddCategoryDialog from '@/components/Category/AddCategoryDialog.vue';

const CategoryStore = useCategoryStore();
const addCategoryDialog = ref(false);
const filter = ref('');
const sortOrder = ref('');

onMounted(async () => {
    await CategoryStore.getAllCategories();
});

const filteredCategorys = computed(() => {
  let Categorys = CategoryStore.categories;

//   if (filter.value === 'resigned') {
//     Categorys = CategoryStore.filterCategorys('resigned');
//   } else if (filter.value === 'active') {
//     Categorys = CategoryStore.filterCategorys('active');
//   }

//   if (sortOrder.value === 'latest') {
//     CategoryStore.sortCategorys('latest');
//   } else if (sortOrder.value === 'oldest') {
//     CategoryStore.sortCategorys('oldest');
//   }

  return Categorys;
});

watch([filter, sortOrder], () => {
  filteredCategorys.value; // Trigger re-computation
});
</script>

<template>
  <AddCategoryDialog v-model:dialog="addCategoryDialog"></AddCategoryDialog>

  <v-container>
    <v-card class="flex-container">
      <v-card-title>
        <v-row>
          <v-col cols="9" style="font-size: 35px;">
            จัดการหมวดหมู่
          </v-col>
          
            <v-row style="margin-left: 6%;">
              <v-col class="pa-2 ma-2" cols="3">
                <v-text-field
                  v-model="CategoryStore.searchQuery"
                  label="ค้นหาหมวดหมู่"
                  append-inner-icon="mdi-magnify"
                  hide-details
                  dense
                ></v-text-field>
              </v-col>
              
              <v-col class="pa-2 mt-2">
                <v-select
                v-model="filter"
                class="placeholder-color forumSize0"
                style="font-size: 35px; margin-left: 5%;"
                label="จัดเรียงตาม"
                 :items="[
                  { label: 'ข้อมูลล่าสุด -> เก่าสุด', value: 'latest' },
                  { label: 'ข้อมูลเก่าสุด -> ล่าสุด', value: 'oldest' },
                ]"
                item-text="label"
                item-value="value"
              ></v-select>
              </v-col>
              
              <v-spacer></v-spacer>
              <v-col class="mt-4" cols="3" width="30%">
                <v-btn color="success" @click="addCategoryDialog = true">
                  <v-icon left>mdi-plus</v-icon>
                  เพิ่มหมวดหมู่
                </v-btn>
              </v-col>
            </v-row>
            
          
          </v-row>

          <v-spacer> </v-spacer>
      </v-card-title>
      <v-card width="90%" style="margin-left: 5%; margin-top: 3%;">
        <v-table class="text-center">
          <thead>
            <tr>
              <th class="text-center"></th>
              <th class="text-center">ชื่อหมวดหมู่</th>
              <th class="text-center">ท็อปปิ้งเพิ่มเติม</th>
              <th class="text-center">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredCategorys" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-center">{{ item.categoryName }}</td>
              <td class="text-center">{{ item.haveTopping }}</td>
              <td class="text-center">
                <v-btn color="#FFDD83" icon="mdi-pencil"></v-btn>
                <v-btn color="#F55050" class="mr-5" icon="mdi-delete"></v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!filteredCategorys.length">
            <tr>
              <td colspan="6" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-card>
  </v-container>
</template>

<style>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}
</style>
