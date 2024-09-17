<script lang="ts" setup>
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';
import { computed, ref } from 'vue';

const ingredientStore = useCheckIngredientStore();
const selectedCategory = ref('coffee'); // Set default to 'coffee'

function closeDialog() {
  ingredientStore.checkingredient = null;
  ingredientStore.dialogCheckItem = false;
}

const formatDate = (dateString: string) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC',
  };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};

const actionTypeLabel = computed(() => {
  return ingredientStore.checkingredient?.actionType === 'check'
    ? 'จำนวนที่นับ'
    : ingredientStore.checkingredient?.actionType === 'issuing'
    ? 'จำนวนนำออก'
    : 'จำนวนที่เลี้ยงรับรอง';
});

// Split ingredients into coffee and rice categories
const coffeeItems = computed(() =>
  ingredientStore.checkingredient?.checkingredientitem.filter(
    (item) => item.type === 'coffee'
  )
);
const riceItems = computed(() =>
  ingredientStore.checkingredient?.checkingredientitem.filter(
    (item) => item.type === 'rice'
  )
);

// Computed property to calculate total price
const totalPrice = computed(() => {
  return ingredientStore.checkingredient?.checkingredientitem.reduce(
    (sum, item) => sum + (item.lastPrice * item.UsedQuantity || 0),
    0
  );
});
</script>

<template>
  <v-dialog v-model="ingredientStore.dialogCheckItem" max-width="50%">
    <v-card>
      <v-card-title>
        <v-row justify="center" align="center">
          <v-icon color="primary" style="font-size: 30px;">mdi-calendar-month</v-icon>
          <strong style="font-size: 18px; margin-left: 8px;">รายละเอียดใบเช็ควัตถุดิบ วันที่ : {{
            formatDate(ingredientStore.checkingredient?.date + '') }}</strong>
        </v-row>

        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-clipboard-text</v-icon>
            <strong style="font-size: 16px;"> รูปแบบ : </strong>
            <span style="font-size: 14px;">
              {{ ingredientStore.checkingredient?.actionType === 'issuing' ? 'นำวัตถุดิบออก' : ( ingredientStore.checkingredient?.actionType === 'check' ? 'เช็ควัตถุดิบ' : 'เลี้ยงรับรอง') }}
            </span>
          </v-col>

          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-account-outline</v-icon>
            <strong style="font-size: 16px;"> ผู้รับผิดชอบ : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.user.userName }}</span>
          </v-col>
        </v-row>

        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-text</v-icon>
            <strong style="font-size: 16px;"> รายละเอียด : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.checkDescription }}</span>
          </v-col>
        </v-row>

        <!-- Total Price -->
        <v-row>
          <v-col style="padding-top: 4px;">
            <v-icon color="primary" left style="font-size: 20px;">mdi-currency-usd</v-icon>
            <strong style="font-size: 16px;"> ราคารวม : </strong>
            <span style="font-size: 14px;">{{ ingredientStore.checkingredient?.totalPrice }}</span>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Category Tabs -->
      <v-tabs v-model="selectedCategory" background-color="primary" grow>
        <v-tab value="coffee">วัตถุดิบร้านกาแฟ</v-tab>
        <v-tab value="rice">วัตถุดิบร้านข้าว</v-tab>
      </v-tabs>

      <!-- Coffee Ingredients Table -->
      <v-tab-item value="coffee" v-if="selectedCategory === 'coffee'">
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th class="column-header text-center">ลำดับ</th>
              <th class="column-header text-center">ชื่อวัตถุดิบ</th>
              <th class="column-header text-center">จำนวนเดิม</th>
              <th class="column-header text-center">{{ actionTypeLabel }}</th>
              <th class="column-header text-center">ราคา/หน่วย</th>
              <th class="column-header text-center">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in coffeeItems" :key="item.CheckIngredientsItemID">
              <th class="column-header text-center">{{ index + 1 }}</th>
              <td>{{ item.ingredient.ingredientName }}</td>
              <td>{{ item.oldRemain }} {{ item.ingredient.ingredientUnit }}</td>
              <td>{{ item.UsedQuantity }} {{ item.ingredient.ingredientUnit }}</td>
              <td>{{ item.lastPrice ? item.lastPrice : '-' }}</td>
              <td>{{ item.lastPrice! * item.UsedQuantity }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-tab-item>

      <!-- Rice Ingredients Table -->
      <v-tab-item value="rice" v-if="selectedCategory === 'rice'">
        <v-table class="text-center mt-5">
          <thead>
            <tr>
              <th class="column-header text-center">ลำดับ</th>
              <th class="column-header text-center">ชื่อวัตถุดิบ</th>
              <th class="column-header text-center">จำนวนเดิม</th>
              <th class="column-header text-center">{{ actionTypeLabel }}</th>
              <th class="column-header text-center">ราคา/หน่วย</th>
              <th class="column-header text-center">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in riceItems" :key="item.CheckIngredientsItemID">
              <th class="column-header text-center">{{ index + 1 }}</th>
              <td>{{ item.ingredient.ingredientName }}</td>
              <td>{{ item.oldRemain }} {{ item.ingredient.ingredientUnit }}</td>
              <td>{{ item.UsedQuantity }} {{ item.ingredient.ingredientUnit }}</td>
              <td>{{ item.lastPrice }}</td>
              <td>{{ item.lastPrice * item.UsedQuantity }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-tab-item>
    </v-card>
  </v-dialog>
</template>

<style scoped>
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
  width: 16.66%;
}

.v-card-title {
  background-color: #f5f5f5;
  padding: 16px;
}
</style>
