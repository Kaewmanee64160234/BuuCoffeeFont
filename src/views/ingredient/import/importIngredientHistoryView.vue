<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const ingredientStore = useIngredientStore();
const router = useRouter();
onMounted(async () => {
    await ingredientStore.getAllHistoryImportIngredients;
});

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
                        ประวัตินำเข้าวัตถุดิบ
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


                        <v-btn color="success" class="button-full-width" :to="{ name: 'importingredients' }">
                            <v-icon left>mdi-plus</v-icon>
                            นำเข้าวัตถุดิบ
                        </v-btn>



                    </v-col>
                </v-row>
            </v-card-title>

            <v-table class="text-center mt-5">
                <thead>
                    <tr>
                        <th></th>
                        <th>วันที่</th>
                        <th>ซัพพาย</th>
                        <th>ราคารวม</th>
                        <th>ส่วนลด</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>แอคชั่น</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in ingredientStore.importingredients" :key="index">
                        <td>{{ index + 1 }}</td>

                        <td>{{ item.date }}</td>
                        <td>{{ item.total }}</td>
                        <td>{{ item.discount }}</td>
                        <td>{{ item.store }}</td>
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
