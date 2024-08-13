<script lang="ts" setup>
import { useCheckIngredientStore } from '@/stores/historyIngredientCheck.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import dialogImportItem from './dialogCheck.vue';
import type { Checkingredient } from '@/types/checkingredientitem.type';
import * as XLSX from 'xlsx';
const ingredientStore = useCheckIngredientStore();
const router = useRouter();
const historyCheckDialog = ref(false);
const selectedCheck = ref<Checkingredient | null>(null);
onMounted(async () => {
    await ingredientStore.getAllHistortIngredients();
});

const formatDate = (dateString: string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
};

const navigateTo = (routeName: string) => {
    router.push({ name: routeName });
};
const openHistoryCheckDialog = (checkingredient: Checkingredient) => {
    ingredientStore.checkingredient = checkingredient;
    ingredientStore.dialogCheckItem = true;
};
function exportToExcel(checkingredient: Checkingredient) {
    const basicData = {
        date: checkingredient.date,
        actionType: checkingredient.actionType,
        checkDescription: checkingredient.checkDescription,
        userName: checkingredient.user.userName,
    };

    
    const tableData = checkingredient.checkingredientitem.map(item => ({
        ingredientName: item.ingredient.ingredientName,
        ingredientSupplier: item.ingredient.ingredientSupplier,
        UsedQuantity: item.UsedQuantity
    }));

    
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet([basicData], { header: Object.keys(basicData) });
    const ws2 = XLSX.utils.json_to_sheet(tableData, { header: Object.keys(tableData[0]) });

    
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws2, 'Details');

    
    XLSX.writeFile(wb, `check_ingredient_${new Date().toISOString()}.xlsx`);
}
</script>

<template>
    <dialogImportItem v-model:dialog="historyCheckDialog" :checkingredient="selectedCheck" />
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
                        <th>รูปแบบ</th>
                        <th>การกระทำ</th>

                    </tr>
                </thead>
                <tbody>

                </tbody>
                <tbody>
                    <tr v-for="(item, index) in ingredientStore.CheckIngredientsHistory" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ formatDate(item.date) }}</td>
                        <td>{{ item.user.userName }}</td>
                        <td :style="{ color: item.actionType === 'issuing' ? 'red' : (item.actionType === 'check' ? '#CCCC00' : 'green') }">
  {{ item.actionType === 'issuing' ? 'นำวัตถุดิบออก' : (item.actionType === 'check' ? 'เช็ควัตถุดิบ' : 'เลี้ยงรับรอง') }}
</td>


                        <td>
                            <v-btn color="#ed8731 " class="mr-2" icon="mdi-pencil"
                                @click="openHistoryCheckDialog(item)"><v-icon color="white"
                                    style="font-size: 20px;">mdi-eye-circle</v-icon></v-btn>


                            <v-btn color="#4CAF50" icon @click="exportToExcel(item)">
                                <v-icon color="white" style="font-size: 20px;">mdi-file-excel</v-icon>
                            </v-btn>
                        </td>

                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<style scoped>

.red-text {
  color: red;
}

.yellow-text {
  color: #0d78f3; 
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
