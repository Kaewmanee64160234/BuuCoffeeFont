<script lang="ts" setup>
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dialogImportItem from './dialogCheck.vue';

const ingredientStore = useCheckIngredientStore();
const router = useRouter();

onMounted(async () => {
    await ingredientStore.getAllHistortIngredients();
});

const formatDate = (dateString: string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
};

const navigateTo = (routeName: string) => {
    router.push({ name: routeName });
};

const showDetail = (items) => {
    ingredientStore.selectedItems = items;
    ingredientStore.dialogCheckItem = true;
};
</script>

<template>
    <dialogImportItem />
    <v-container>
        <v-card>
            <v-card-title>
                <v-row>
                    <v-col cols="9">
                        ประวัติเช็ควัตถุดิบ
                    </v-col>
                    <v-col cols="3">
                        <v-text-field label="ค้นหาประวัติการเช็ควัตถุดิบ" append-inner-icon="mdi-magnify" hide-details
                            dense></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>


                        <v-btn color="success" class="button-full-width" :to="{ name: 'checkingredient' }">
                            <v-icon left>mdi-plus</v-icon>
                            เช็ควัตถุดิบ
                        </v-btn>



                    </v-col>
                </v-row>
            </v-card-title>

            <v-table class="mx-auto" style="width: 97%">
                <thead>
                    <tr>
                        <th></th>
                        <th>วันที่</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>แอคชั่น</th>

                    </tr>
                </thead>
                <tbody>

                </tbody>
                <tbody>
                    <tr v-for="(item, index) in ingredientStore.CheckIngredientsHistory" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ formatDate(item.date) }}</td>
                        <td>{{ item.user.userName }}</td>
                        <td>
                            <v-btn color="#FFDD83" class="mr-2" icon="mdi-pencil"
                                @click="showDetail(item.checkingredientitem)">ดู</v-btn>

                        </td>
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

th,
td {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
    text-align: center !important;
}
</style>
