<script lang="ts" setup>
import { useHistoryIngredientImportStore } from '@/stores/historyIngredientimport.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import dialogCheckItem from './dialogImport.vue';
const ingredientStore = useHistoryIngredientImportStore();
const router = useRouter();
onMounted(async () => {
    await ingredientStore.getAllHistoryImportIngredients();
});
const showDetail = (items) => {
  ingredientStore.selectedItems = items;
  ingredientStore.dialogimportkitem = true;
};

const navigateTo = (routeName: string) => {
    router.push({ name: routeName });
};
const formatDate = (date: any) => {
    if (!date) return ''; // กรณีไม่มีข้อมูลวันที่

    const jsDate = new Date(date.toString()); // แปลงข้อมูลวันที่เป็น string เป็นวัตถุ Date
    const formattedDate = jsDate.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }); // กำหนดรูปแบบวันที่และเวลาตามที่ต้องการ
    return formattedDate;
};
</script>

<template>
<dialogCheckItem/>
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


                        <v-btn color="success" class="button-full-width" :to="{ name: 'importingredients' }">
                            <v-icon left>mdi-plus</v-icon>
                            นำเข้าวัตถุดิบ
                        </v-btn>



                    </v-col>
                </v-row>
            </v-card-title>

            <v-table class="mx-auto" style="width: 97%">
                <thead>
    <tr>
        <th class="column-header">ลำดับ</th>
        <th class="column-header">วันที่</th>
        <th class="column-header">ซัพพาย</th>
        <th class="column-header">ราคารวม</th>
        <th class="column-header">ส่วนลด</th>
        <th class="column-header">ผู้รับผิดชอบ</th>
        <th class="column-header">แอคชั่น</th>
    </tr>
</thead>
<tbody>
    <tr v-for="(item, index) in ingredientStore.importIngredientsHistory" :key="index">
        <td>{{ index + 1 }}</td>
        <td>{{ formatDate(item.date) }}</td>
        <td>{{ item.store }}</td>
        <td>{{ item.total }}</td>
        <td>{{ item.discount }}</td>
        <td>{{ item.user.userName }}</td>
        <td>
            <v-btn color="#FFDD83" class="mr-2" icon="mdi-pencil" @click="showDetail(item.importingredientitem)">ดู</v-btn>

            <!--  -->
        </td>
    </tr>
</tbody>

                <tbody v-if="!ingredientStore.importIngredientsHistory.length">
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
