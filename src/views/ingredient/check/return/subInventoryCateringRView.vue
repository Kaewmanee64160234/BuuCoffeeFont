<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import type { SubInventoriesCoffee } from '@/types/subinventoriescoffee.type';

const ingredientStore = useIngredientStore();
const subInventoryStore = useSubIngredientStore();
const selectedTab = ref('วัตถุดิบร้านกาแฟ');
const searchQuery = ref('');

// Filtered ingredients based on the selected tab and search query
const ingredientFilters = computed(() => {
  if (selectedTab.value === 'วัตถุดิบร้านกาแฟ') {
    return subInventoryStore.subIngredients_catering.filter(
      (item: SubInventoriesCoffee) => item.type === 'coffee' && 
      item.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } else if (selectedTab.value === 'วัตถุดิบร้านข้าว') {
    return subInventoryStore.subIngredients_catering.filter(
      (item: SubInventoriesCoffee) => item.type === 'rice' && 
      item.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  return [];
});

onMounted(async () => {
  await subInventoryStore.getSubIngredients_catering();
});

// Watch for tab changes and apply filtering
watch([selectedTab, searchQuery], () => {
  // Whenever tab or searchQuery changes, ingredients are filtered
});

const saveCheckData = async () => {
  try {
    const confirmation = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, บันทึก!',
      cancelButtonText: 'ไม่, ยกเลิก!',
    });

    if (confirmation.isConfirmed) {
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        text: 'กรุณารอสักครู่ขณะที่เราบันทึกข้อมูลของคุณ.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await subInventoryStore.createReturnIngredientsForCatering();
      subInventoryStore.ingredientCheckList = [];
      await subInventoryStore.getSubIngredients_catering();

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว.',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
    }
  } catch (error) {
    console.error('Error saving check data:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลของคุณ.',
      icon: 'error',
    });
  }
};

</script>

<template>
  <v-container fluid style="padding-left: 80px;">
    <v-card-title>
      <v-row>
        <v-col cols="9" style="padding: 10px;">
          <h3>คืนวัตถุดิบเหลือร้านเลี้ยงรับรอง</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-text-field label="ค้นหาวัตถุดิบ" append-inner-icon="mdi-magnify" dense hide-details
            variant="solo" outlined v-model="searchQuery"></v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-btn color="success" :to="{ name: 'ingredients_catering' }">
            <v-icon left>mdi-arrow-u-left-top-bold </v-icon> ย้อนกลับ
          </v-btn>
        </v-col>
      </v-row>
      <v-tabs v-model="selectedTab" align-tabs="start" color="brown" background-color="#fff">
        <v-tab value="วัตถุดิบร้านกาแฟ">วัตถุดิบร้านกาแฟ</v-tab>
        <v-tab value="วัตถุดิบร้านข้าว">วัตถุดิบร้านข้าว</v-tab>
      </v-tabs>
    </v-card-title>

    <v-row>
      <v-col cols="6">
        <v-container>
          <v-row>
            <v-col cols="3" style="text-align: center; padding: 8px" v-for="(item, index) in ingredientFilters" :key="index">
              <v-card width="100%" @click="subInventoryStore.addSubIngredients(item.ingredient, item.type!,item.lastPrice)">
                <v-img :src="`http://localhost:3000/ingredients/${item.ingredient.ingredientId}/image`" height="100"></v-img>
                <v-card-title style="font-size: 14px">{{ item.ingredient.ingredientName }}</v-card-title>
                <v-card-subtitle style="font-size: 12px">{{ item.ingredient.ingredientSupplier }}</v-card-subtitle>
                <v-card-subtitle style="font-size: 12px">จำนวนที่เบิก : {{ item.quantity }}</v-card-subtitle>
                <v-card-subtitle style="font-size: 12px">{{ item.type == 'coffee' ? 'ร้านกาแฟ' : 'ร้านข้าว' }}</v-card-subtitle>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="6">
        <v-card style="height: 400px; overflow-y: auto; width: 100%">
          <v-table style="max-height: 100%; overflow-y: auto">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อสินค้า</th>
                <th>แบรนด์</th>
                <th>จำนวนที่เบิก</th>
                <th>จำนวนที่เหลือ</th>
                <th>แอคชั่น</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in subInventoryStore.ingredientCheckList" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.ingredientcheck.ingredientName }}</td>
                <td>{{ item.ingredientcheck.ingredientSupplier }}</td>
                <td>{{ item.count }}</td>
                <td>
                  <input type="number" v-model.number="item.count" class="styled-input" />
                </td>
                <td>
                  <button @click="subInventoryStore.removeCheckIngredient(item.ingredientcheck,item.type)" class="styled-button">
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <v-row>
          <v-col cols="12">
            <v-text-field v-model="ingredientStore.checkDescription" label="กรุณาระบุหมายเหตุ **ถ้ามี" dense hide-details variant="solo"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn color="success" class="button-full-width" @click="saveCheckData">
              <v-icon left>mdi-plus</v-icon>
              บันทึกข้อมูล
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.button-full-width {
  width: 100%;
}
.styled-input {
  border: 2px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  font-size: 16px;
  width: 100%;
}
thead {
  background-color: #f9f9f9;
}
th, td {
  padding: 12px;
  text-align: center;
}
</style>
