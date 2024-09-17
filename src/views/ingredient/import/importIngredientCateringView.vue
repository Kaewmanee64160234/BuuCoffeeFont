<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import type { SubInventoriesCoffee } from '@/types/subinventoriescoffee.type';

// Stores
const ingredientStore = useIngredientStore();
const subIngredientStore = useSubIngredientStore();
const type = ref('');

// Local state
const selectedTab = ref('วัตถุดิบร้านกาแฟ'); // Default selected tab
const ingredientFilters = ref<SubInventoriesCoffee[]>([]); // Filtered ingredients based on selected tab
const searchQuery = ref('');
const totalPrice = ref(0); // Reactive reference for total price

// Calculate the total price based on ingredientCheckList
const calculateTotalPrice = () => {
  totalPrice.value = subIngredientStore.ingredientCheckList.reduce((sum, item) => {
    return sum + (item.lastPrice! * item.count || 0);
  }, 0);
};

// Fetch data on component mount
onMounted(async () => {
  await ingredientStore.getIngredients();
  await subIngredientStore.getSubIngredients_coffee();
  await subIngredientStore.getSubIngredients_rice();
  filterIngredients(); // Filter ingredients after data is loaded
  calculateTotalPrice(); // Calculate the initial total price
});

// Watch the selected tab and filter ingredients accordingly and set type
watch(selectedTab, () => {
  filterIngredients();
  type.value = selectedTab.value === 'วัตถุดิบร้านกาแฟ' ? 'coffee' : 'rice';
});

// Watch for changes in ingredientCheckList to recalculate total price
watch(
  () => subIngredientStore.ingredientCheckList,
  () => {
    calculateTotalPrice();
  },
  { deep: true }
);

// Filtering function for ingredients based on the selected tab
function filterIngredients() {
  if (selectedTab.value === 'วัตถุดิบร้านกาแฟ') {
    ingredientFilters.value = subIngredientStore.subingredients_coffee.filter(item =>
      item.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    type.value = 'coffee';
  } else if (selectedTab.value === 'วัตถุดิบร้านข้าว') {
    ingredientFilters.value = subIngredientStore.subingredients_rice.filter(item =>
      item.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    type.value = 'rice';
  }
}

// Function to save ingredient check data
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

      await subIngredientStore.createReturnWithdrawalIngredientsForCateringHistory(totalPrice.value);
      subIngredientStore.ingredientCheckList = [];

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
        <v-col cols="9" style="padding: 20px;">
          <h3>บันทึกประวัติการเลี้ยงรับรอง</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3">
          <v-text-field 
            label="ค้นหาวัตถุดิบ" 
            append-inner-icon="mdi-magnify" 
            dense 
            hide-details 
            variant="solo" 
            outlined 
            v-model="searchQuery">
          </v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-btn color="success" :to="{ name: 'ingredients_catering' }">
            <v-icon left>mdi-arrow-u-left-top-bold </v-icon> ย้อนกลับ
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <!-- Tabs for Coffee and Rice Ingredients -->
    <v-tabs v-model="selectedTab" align-tabs="start" color="brown" background-color="#fff">
      <v-tab value="วัตถุดิบร้านกาแฟ">วัตถุดิบร้านกาแฟ</v-tab>
      <v-tab value="วัตถุดิบร้านข้าว">วัตถุดิบร้านข้าว</v-tab>
    </v-tabs>

    <v-row>
      <v-col cols="6">
        <v-container>
          <v-row>
            <v-col cols="3" style="text-align: center; padding: 8px" v-for="(item, index) in ingredientFilters" :key="index">
              <v-card width="100%" @click="subIngredientStore.addSubIngredients(item.ingredient, type, item.lastPrice!)">
                <v-img :src="`http://localhost:3000/ingredients/${item.ingredient.ingredientId}/image`" height="100"></v-img>
                <v-card-title style="font-size: 14px">{{ item.ingredient.ingredientName }}</v-card-title>
                <v-card-subtitle style="font-size: 12px">{{ item.ingredient.ingredientSupplier }}</v-card-subtitle>
                <v-card-subtitle style="font-size: 12px">ราคาต้นทุน {{ item.lastPrice }} บาท</v-card-subtitle>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <v-col cols="6">
        <v-card style="height: 400px; overflow-y: auto;">
          <v-table>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อสินค้า</th>
                <th>แบรนด์</th>
                <th>ราคา</th>
                <th>จำนวน</th>
                <th>แอคชั่น</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in subIngredientStore.ingredientCheckList" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.ingredientcheck.ingredientName }}</td>
                <td>{{ item.ingredientcheck.ingredientSupplier }}</td>
                <td>{{ item.lastPrice }}</td>
                <td>
                  <input type="number" v-model.number="item.count" class="styled-input" />
                </td>
                <td>
                  <button @click="subIngredientStore.removeCheckIngredient(item.ingredientcheck, item.type)" class="styled-button">ลบ</button>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Total Price Editable Field -->
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model.number="totalPrice"
              label="ราคารวม"
              dense
              hide-details
              variant="solo"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Note Field -->
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="ingredientStore.checkDescription" label="กรุณาระบุหมายเหตุ **ถ้ามี" dense hide-details variant="solo"></v-text-field>
          </v-col>
        </v-row>

        <!-- Save Button -->
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

th,
td {
  padding: 12px;
  text-align: center;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .styled-input {
    font-size: 14px;
    padding: 6px;
  }
}

@media (max-width: 768px) {
  .styled-input {
    font-size: 12px;
    padding: 4px;
  }
}
</style>
