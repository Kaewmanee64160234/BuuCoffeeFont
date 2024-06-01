<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { onMounted } from 'vue';

const ingredientStore = useIngredientStore();


onMounted(async () => {
  await ingredientStore.getAllIngredients();
});
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            นำเข้าวัตถุดิบ
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">
            <v-text-field 
              label="ค้นหาวัตถุดิบ" 
              append-inner-icon="mdi-magnify" 
              hide-details 
              dense
              v-model="ingredientStore.search"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-btn color="success">
              <v-icon left>mdi-plus</v-icon>
              รายการวัตถุดิบ
            </v-btn>
          </v-col>
          <v-col>
            <v-btn color="success">
              <v-icon left>mdi-plus</v-icon>
              ประวัตินำเข้าวัตถุดิบ
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-row>
        <v-col>
          <v-container>
            <v-row>
              <v-col 
                cols="3" 
                style="text-align: center" 
                v-for="(item, index) in ingredientStore.ingredients" 
                :key="index"
              >
                <v-card width="100%" @click="ingredientStore.Addingredient(item)">
                  <v-card-item></v-card-item>
                  <v-card-text>
                    <v-img :src="`http://localhost:3000/ingredients/${item.IngredientId}/image`"></v-img>
                  </v-card-text>
                  <v-card-title>{{ item.nameIngredient }}</v-card-title>
                  <v-card-title>{{ item.supplier }}</v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col>
          <v-card style="max-height: 500px; overflow-y: auto;">
            <v-table>
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อสินค้า</th>
                  <th>แบรนด์</th>
                  <th>จำนวน</th>
                  <th>ราคารวม</th>
                  <th>แอคชั่น</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in ingredientStore.ingredientList" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.ingredient.nameIngredient }}</td>
                  <td>{{ item.ingredient.supplier }}</td>
                  <td><input type="number" v-model.number="item.count" /></td>
                  <td><input type="number" v-model.number="item.totalunit" /></td>
                  <td><button @click="ingredientStore.removeIngredient(index)">ลบ</button></td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
          <v-row>
            <v-col>
              <v-row>
                <v-col>ชื่อร้านค้า</v-col>
                <v-col>
                  <v-text-field 
                    label="กรุณากรอกชื่อร้านค้า" 
                    hide-details 
                    dense 
                    v-model="ingredientStore.store"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>ส่วนลด</v-col>
                <v-col>
                  <v-text-field 
                    label="กรุณากรอกส่วนลด" 
                    hide-details 
                    dense 
                    v-model="ingredientStore.discount"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col>
              <v-row>
                <v-col>ราคารวมใบเสร็จ</v-col>
                <v-col>
                  <v-text-field 
                    label="กรุณากรอกราคารวมใบเสร็จ" 
                    hide-details 
                    dense 
                    v-model="ingredientStore.total"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="ingredientStore.saveImportData">
                <v-icon left>mdi-plus</v-icon>
                บันทึกข้อมูล
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Kanit', sans-serif;
}
</style>
