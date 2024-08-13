<script lang="ts" setup>
import { useHistoryIngredientImportStore } from '@/stores/historyIngredientimport.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import dialogCheckItem from './dialogImport.vue';
import type { Importingredient } from '@/types/importIngredient.type';
const historyImportDialog = ref(false);
const ingredientStore = useHistoryIngredientImportStore();
const router = useRouter();
const selectedImport = ref<Importingredient | null>(null);
onMounted(async () => {
    await ingredientStore.getAllHistoryImportIngredients();
});

const navigateTo = (routeName: string) => {
    router.push({ name: routeName });
};
const formatDate = (dateString: string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
};
// const formatDate = (date: any) => {
//   if (!date) return ''; // กรณีไม่มีข้อมูลวันที่

//   const jsDate = new Date(date.toString()); // แปลงข้อมูลวันที่เป็น string เป็นวัตถุ Date
//   const formattedDate = jsDate.toLocaleDateString('th-TH', { 
//     day: '2-digit', 
//     month: '2-digit', 
//     year: 'numeric', 
//     timeZone: 'Asia/Bangkok' 
//   }); // กำหนดรูปแบบวันที่ตามที่ต้องการ
  
//   const formattedTime = jsDate.toLocaleTimeString('th-TH', {
//     hour: '2-digit',
//     minute: '2-digit',
//     timeZone: 'Asia/Bangkok'
//   }); // กำหนดรูปแบบเวลาตามที่ต้องการ
  
//   return `${formattedDate} เวลา ${formattedTime}`; // รวมวันที่และเวลาเข้าด้วยกัน
// };
const openHistoryCheckDialog = (importingredient: Importingredient) => {
    ingredientStore.importingredient = importingredient;
    ingredientStore.dialoImportItem = true;
};
</script>

<template>
<dialogCheckItem v-model:dialog="historyImportDialog" :importingredient="selectedImport" />
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
        <th style="text-align: center;font-weight: bold;"></th>
        <th style="text-align: center;font-weight: bold;">วันที่</th>
        <th style="text-align: center;font-weight: bold;">ซัพพาย</th>
        <th style="text-align: center;font-weight: bold;">ราคารวม</th>
        <th style="text-align: center;font-weight: bold;">ส่วนลด</th>
        <th style="text-align: center;font-weight: bold;">รูปแบบ</th>
        <th style="text-align: center;font-weight: bold;">การกระทำ</th>
    </tr>
</thead>
<tbody>
    <tr v-for="(item, index) in ingredientStore.importIngredientsHistory" :key="index">
        <td>{{ index + 1 }}</td>
        <td>{{ formatDate(item.date) }}</td>
        <td>{{ item.store }}</td>
        <td>{{ item.total }}</td>
        <td>{{ item.discount }}</td>
        <td>{{ item.importStoreType }}</td>
        <td>
            <v-btn color="#FFDD83" class="mr-2" icon="mdi-pencil" @click="openHistoryCheckDialog(item)">ดู</v-btn>

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
