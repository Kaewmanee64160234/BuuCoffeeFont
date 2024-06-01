<script lang="ts" setup>

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();


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
                        ประวัติเช็ควัตถุดิบ
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


                        <v-btn color="success" class="button-full-width" :to="{ name: 'checkingredient' }">
                            <v-icon left>mdi-plus</v-icon>
                            เช็ควัตถุดิบ
                        </v-btn>



                    </v-col>
                </v-row>
            </v-card-title>

            <v-table class="text-center mt-5">
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
                <!-- <tbody v-if="!ingredientStore.ingredients.length">
                    <tr>
                        <td colspan="9" class="text-center">No data</td>
                    </tr>
                </tbody> -->
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
