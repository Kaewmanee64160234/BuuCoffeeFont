<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import type { Ingredient } from '@/types/ingredient.type';
import { computed, onMounted, ref, watch } from 'vue';

const ingredientList = ref<{ ingredient: Ingredient; count: number }[]>([]);
const ingredientStore = useIngredientStore();

function Addingredient(item: Ingredient) {
    const exists = ingredientList.value.some(ingredient => ingredient.ingredient.IngredientId === item.IngredientId);
    if (!exists) {
        ingredientList.value.push({ ingredient: item, count: 1 });
    }
}

function removeIngredient(index: number) {
    ingredientList.value.splice(index, 1);
}

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
                        นำเข้าวัสถุดิบ
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="3">
                        <v-text-field label="Search" append-inner-icon="mdi-magnify" hide-details dense></v-text-field>
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
                            <v-col cols="3" style="text-align: center" v-for="(item, index) in ingredientStore.ingredients"
                                :key="index">
                                <v-card width="100%" @click="Addingredient(item)">
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
                                <tr v-for="(item, index) in ingredientList" :key="index">
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ item.ingredient.nameIngredient }}</td>
                                    <td>{{ item.ingredient.supplier }}</td>
                                    <td><input type="number" v-model.number="item.count" /></td>
                                    <td><input type="number" /></td>
                                    <td><button @click="removeIngredient(index)">ลบ</button></td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                    <v-row>
                        <v-col>
                            <v-row>
                                <v-col>ชื่อร้านค้า</v-col>
                                <v-col><v-text-field label="กรุณากรอกชื่อร้านค้า" hide-details dense></v-text-field></v-col>
                            </v-row>
                            <v-row>
                                <v-col>ส่วนลด</v-col>
                                <v-col><v-text-field label="กรุณากรอกส่วนลด" hide-details dense></v-text-field></v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row>
                                <v-col>ราคารวมใบเสร็จ</v-col>
                                <v-col><v-text-field label="กรุณากรอกราคารวมใบเสร็จ" hide-details dense></v-text-field></v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn color="success">
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
/* Add your styles here */
</style>
