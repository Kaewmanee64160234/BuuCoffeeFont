<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
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
                <v-list-item>
                  <v-list-item-title> เช็ควัตถุดิบ </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>ประวัติเช็ควัตถุดิบ </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col>
            <v-btn color="success" class="button-full-width">
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
            <th>Image</th>
            <th>Name</th>
            <th>Quantity in Stock</th>
            <th>Quantity per Unit</th>
            <th>Supplier</th>
            <th>Minimum</th>
            <th>Unit</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ingredientStore.ingredients" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <v-img :src="`http://localhost:3000/ingredients/${item.IngredientId}/image`" height="100"></v-img>
            </td>
            <td>{{ item.nameIngredient }}</td>
            <td :style="{ color: item.quantityInStock < item.minimun ? 'red' : 'black' }">{{ item.quantityInStock }}</td>
            <td>{{ item.quantityPerUnit }}</td>
            <td>{{ item.supplier }}</td>
            <td>{{ item.minimun }}</td>
            <td>{{ item.unit }}</td>
            <td>
              <v-btn color="#FFDD83" class="mr-2" icon="mdi-pencil"></v-btn>
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
</style>
