<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import IngredientDialog from "@/views/ingredient/IngredientDialog.vue"
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from 'vue-router'; 

const ingredientStore = useIngredientStore();
const router = useRouter(); 

const menu1 = ref(false);
const menu2 = ref(false);
const paginate = ref(true);

onMounted(async () => {
  await ingredientStore.getAllIngredients();
});
const deleteIngredient = async (id?: number) => {
  if (id !== undefined) {
    await ingredientStore.deleteIngredient(id);
  } else {
    console.error("Ingredient ID is undefined");
  }
};


const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

watch(paginate, async (newPage, oldPage) => {
  if (paginate.value) {
    // ingredientStore.cat = "";
    await ingredientStore.getAllIngredients();
  } else {
    await ingredientStore.getAllIngredients();
  }
});

</script>

<template>
  <IngredientDialog></IngredientDialog>
  <v-container v-if="paginate">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            รายการวัตถุดิบ
          </v-col>
          <v-col cols="3">
            <v-text-field label="ค้นหา" append-inner-icon="mdi-magnify" hide-details dense v-model="ingredientStore.keyword"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
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
            <v-btn color="success" class="button-full-width" @click="ingredientStore.dialog = true">
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
            <td>{{ item.ingredientSupplier }}</td>
            <td :style="{ color: item.ingredientQuantityInStock <= item.ingredientMinimun ? 'red' : 'black' }">{{ item.ingredientQuantityInStock }} {{ item.ingredientUnit }}</td>
            <td>{{ item.ingredientQuantityPerUnit }} {{ item.ingredientQuantityPerSubUnit}}</td>
            <td>{{ item.ingredientMinimun }} {{ item.ingredientUnit }}</td>
            <td>{{ item.ingredientRemining }} {{ item.ingredientQuantityPerSubUnit }}</td>
            <td>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil" @click="ingredientStore.setEditedIngredient(item)"></v-btn>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-delete" @click="deleteIngredient(item.ingredientId)"></v-btn>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!ingredientStore.ingredients.length">
          <tr>
            <td colspan="9" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>

      <v-pagination
            justify="center"
            v-model="ingredientStore.page"
            :length="ingredientStore.lastPage"
            rounded="circle"
          ></v-pagination>

  
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
