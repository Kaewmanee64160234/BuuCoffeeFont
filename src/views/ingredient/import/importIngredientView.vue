<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useIngredientStore } from '@/stores/Ingredient.store';

const ingredientStore = useIngredientStore();
const searchQuery = ref('');

onMounted(async () => {
    await ingredientStore.getAllIngredients();
});

watch(searchQuery, async (newQuery) => {
  if (newQuery.length >= 3) {
    await ingredientStore.searchIngredients(newQuery);
  } else if (newQuery.length === 0) {
    await ingredientStore.getAllIngredients();
  }
});

function onSearch() {
  if (searchQuery.value.length >= 3) {
    ingredientStore.searchIngredients(searchQuery.value);
  } else if (searchQuery.value.length === 0) {
    ingredientStore.getAllIngredients();
  }
}
</script>

<template>
    <v-container fluid>
        <v-card style="height: 100vh; width: 100vw; overflow-y: auto;">
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
                            hide-details dense 
                            v-model="searchQuery"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="success" :to="{ name: 'ingredients' }">
                            รายการวัตถุดิบ
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="warning" :to="{ name: 'importingredientsHistory' }">
                            ประวัตินำเข้าวัตถุดิบ
                        </v-btn>
                    </v-col>
                </v-row>
                <v-spacer></v-spacer>
            </v-card-title>
            <v-row>
                <v-col cols="6" class="d-flex flex-column">
                    <v-container>
                        <v-row>
                            <v-col cols="3" style="text-align: center; padding: 8px;"
                                v-for="(item, index) in ingredientStore.ingredients" :key="index">
                                <v-card width="100%" @click="ingredientStore.Addingredient(item)"
                                    style="height: 200px;">
                                    <v-img :src="`http://localhost:3000/ingredients/${item.ingredientId}/image`"
                                        height="100"></v-img>
                                    <v-card-title style="font-size: 14px;">{{ item.ingredientName }}</v-card-title>
                                    <v-card-subtitle style="font-size: 12px;">{{ item.ingredientSupplier}}</v-card-subtitle>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
                <v-col cols="6" class="d-flex flex-column">

                    <v-card style="height: 400px; overflow-y: auto; width: 100%;">
                        <v-table style="max-height: 100%; overflow-y: auto;">
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
                                    <td>{{ item.ingredient.ingredientName }}</td>
                                    <td>{{ item.ingredient.ingredientSupplier }}</td>
                                    <td><input type="number" v-model.number="item.count" class="styled-input" /></td>
                                    <td><input type="number" v-model.number="item.totalunit" class="styled-input" />
                                    </td>
                                    <td><button @click="ingredientStore.removeIngredient(index)">ลบ</button></td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>

                    <v-row>
                        <v-spacer></v-spacer>
                        <v-col cols="6">
                            <v-row>
                                <v-col>ชื่อร้านค้า</v-col>
                                <v-col>
                                    <v-text-field label="กรุณากรอกชื่อร้านค้า" hide-details dense
                                        v-model="ingredientStore.store"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>ส่วนลด</v-col>
                                <v-col>
                                    <v-text-field label="กรุณากรอกส่วนลด" hide-details dense
                                        v-model="ingredientStore.discount"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="6">
                            <v-row>
                                <v-col>ราคารวมใบเสร็จ</v-col>
                                <v-col>
                                    <v-text-field label="กรุณากรอกราคารวมใบเสร็จ" hide-details dense
                                        v-model="ingredientStore.total"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn @click="ingredientStore.saveImportData" color="orange">
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

.styled-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
}

.styled-input:focus {
    border-color: #66afe9;
    outline: none;
    box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
}

.styled-button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #d9534f;
    color: white;
    font-size: 14px;
    cursor: pointer;
}

.styled-button:hover {
    background-color: #c9302c;
}

th, td {
  padding-top: 12px !important; 
  padding-bottom: 12px !important; 
  text-align: center !important; 
}

th {
    background-color: #f9f9f9;
}

tbody tr:nth-child(odd) {
    background-color: #f2f2f2;
}
</style>
