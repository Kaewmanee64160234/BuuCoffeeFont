<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import IngredientDialog from "@/views/ingredient/IngredientDialog.vue"
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'; 
const ingredientStore = useIngredientStore();
const router = useRouter(); 
onMounted(async () => {
  await ingredientStore.getAllIngredients();
});

const menu1 = ref(false);
const menu2 = ref(false);
const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};
</script>

<template>
  <IngredientDialog></IngredientDialog>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            รายการวัตถุดิบ
          </v-col>
          <v-col cols="3">
            <v-text-field label="Search" append-inner-icon="mdi-magnify" hide-details dense></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn color="success" class="button-full-width">
              <v-icon left>mdi-filter</v-icon>
              กรอง
            </v-btn>
          </v-col>
          <v-col>
            <v-menu v-model="menu1" offset-y>
              <template v-slot:activator="{ props }">
                <v-btn color="success" class="button-full-width" v-bind="props">
                  <v-icon left>mdi-plus</v-icon>
                  นำเข้าวัตถุดิบ
                </v-btn>
              </template>
              <v-list>
             
                  <v-list-item @click="navigateTo('importingredients')">
                    <v-list-item-title>นำเข้าวัตถุดิบ</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="navigateTo('importingredientsHistory')">
                    <v-list-item-title>ประวัติการนำเข้าวัตถุดิบ</v-list-item-title>
                  </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col>
            <v-menu v-model="menu2" offset-y>
              <template v-slot:activator="{ props }">
                <v-btn color="success" class="button-full-width" v-bind="props">
                  <v-icon left>mdi-plus</v-icon>
                  เช็ควัตถุดิบ 
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="navigateTo('checkingredient')">
                  <v-list-item-title> เช็ควัตถุดิบ </v-list-item-title>
                </v-list-item>
                <v-list-item @click="navigateTo('checkingredientHistory')">
                  <v-list-item-title>ประวัติเช็ควัตถุดิบ </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col>
            <v-btn color="success" class="button-full-width"  @click="ingredientStore.dialog = true">
              <v-icon left>mdi-check</v-icon>
             เพิ่มวัตถุดิบ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th></th>
            <th>รูปภาพ</th>
            <th>ชื่อวัตถุดิบ</th>
            <th>ผู้จัดจำหน่าย</th>
            <th>จำนวนเหลือในคลัง</th>
            <th>จำนวนต่อหน่วย</th>
            <th>จำนวนขั้นต่ำ</th>
            <th>หน่วยที่ถูกใช้ไป</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.ingredients" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <v-img :src="`http://localhost:3000/ingredients/${item.ingredientId}/image`" height="100"></v-img>
            </td>
            <td>{{ item.ingredientName }}</td>
            <td>{{ item.igredientSupplier }}</td>
            <td :style="{ color: item.igredientQuantityInStock < item.igredientMinimun ? 'red' : 'black' }">{{ item.igredientQuantityInStock }} {{ item.igredientUnit }}</td>
            <td>{{ item.igredientQuantityPerUnit }} {{ item.igredientQuantityPerSubUnit}}</td>
            <td>{{ item.igredientMinimun }} {{ item.igredientUnit }}</td>
            <td>{{ item.igredientRemining }}  {{ item.igredientQuantityPerSubUnit}}</td>
            <td>
              <v-btn
                  color="#FFDD83"
                  class="mr-5"
                  icon="mdi-pencil"
                  @click="ingredientStore.setEditedIngredient(item);
"
                ></v-btn>

              <v-btn color="#F55050" icon="mdi-delete"></v-btn>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!ingredientStore.ingredients.length">
          <tr>
            <td colspan="9" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

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
