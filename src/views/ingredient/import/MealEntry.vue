<template>
    <v-card class="mb-5">
        <v-card-text>
            <v-btn color="primary" @click="cateringStore.addMeal" class="button-full-width"> <v-icon left></v-icon> <strong>เพิ่มมื้อการจัดเลี้ยง</strong>
            </v-btn>
            <v-expansion-panels class="mb-5">
                <v-expansion-panel v-for="(meal, index) in cateringStore.meals" :key="index">
                    <v-expansion-panel-header>
                        <v-row>
                            <v-card-title>รายละเอียดมื้ออาหาร #{{ index + 1 }}</v-card-title>
                            <v-col>
                                <v-btn icon @click="cateringStore.removeMeal(index)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content style="background-color: #f6d3bb;">
                        <v-row>
                            <v-col cols="4">
                                <v-text-field label="Meal Name" v-model="meal.mealName" dense hide-details
                                    variant="solo"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Meal Time" v-model="meal.mealTime" type="time" dense hide-details
                                    variant="solo">
                                </v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Total Price"  v-model.number="meal.totalPrice" dense hide-details
                                    variant="solo" disabled>
                                </v-text-field>
                            </v-col>

                        </v-row>

                        <v-card-title>
                            <v-row>
                                <v-col cols="9" style="padding: 20px;">
                                    <h3>การเลี้ยงรับรอง - วัตถุดิบ</h3>
                                </v-col>
                                <v-col cols="3">
                                    <v-text-field label="ค้นหาวัตถุดิบ" append-inner-icon="mdi-magnify" dense
                                        hide-details variant="solo" outlined v-model="searchQuery"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-title>

                        <v-tabs v-model="selectedTab" align-tabs="start" color="brown" background-color="#fff">
                            <v-tab value="coffee">วัตถุดิบร้านกาแฟ</v-tab>
                            <v-tab value="rice">วัตถุดิบร้านข้าว</v-tab>
                        </v-tabs>

                        <v-row>
                            <v-col cols="6">
                                <v-container>
                                    <v-row>
                                        <v-col cols="3" style="text-align: center; padding: 8px"
                                            v-for="(item, index) in ingredientFilters" :key="index">
                                            <v-card width="100%" @click="addIngredientToMeal(item)">
                                                <v-img
                                                    :src="`http://localhost:3000/ingredients/${item.ingredient.ingredientId}/image`"
                                                    height="100"></v-img>
                                                <v-card-title style="font-size: 14px">{{ item.ingredient.ingredientName
                                                    }}</v-card-title>
                                                <v-card-subtitle style="font-size: 12px">{{
                                                    item.ingredient.ingredientSupplier }}</v-card-subtitle>
                                                <v-card-subtitle style="font-size: 12px">ราคาต้นทุน {{ item.lastPrice }}
                                                    บาท</v-card-subtitle>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-col>

                            <v-col cols="6">
                                <v-card style="height: 400px; overflow-y: auto;">
                                    <v-table>
                                        <thead>
                                            <tr>
                                                <th>ลำดับ</th>
                                                <th>ชื่อสินค้า</th>
                                                <th>คลัง</th>
                                                <th>ราคารวม</th>
                                                <th>จำนวน</th>
                                                <th>แอคชั่น</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(item, itemIndex) in meal.mealIngredient" :key="itemIndex">
                                                <td>{{ itemIndex + 1 }}</td>
                                                <td>{{ item.ingredient.ingredientName }}</td>
                                                <td>{{ item.type }}</td>
                                                <td>{{ item.totalPrice }}</td>
                                                <td>
                                                    <input type="number" v-model.number="item.quantity"
                                                        class="styled-input" />
                                                </td>
                                                <td>
                                                    <button @click="removeIngredientFromMeal(index, itemIndex)"
                                                        class="styled-button">
                                                        ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import { useCateringStore } from '@/stores/catering.store';
import type { SubInventoriesCoffee } from '@/types/subinventoriescoffee.type';
import { useIngredientStore } from '@/stores/Ingredient.store';
const ingredientStore = useIngredientStore();
const cateringStore = useCateringStore();
const subIngredientStore = useSubIngredientStore();
const activePanelIndex = ref(0);
const searchQuery = ref('');
const selectedTab = ref('coffee');
const ingredientFilters = ref<SubInventoriesCoffee[]>([]);
const totalPrice = ref(0);
const type = ref('');
const removeIngredientFromMeal = (index: number, itemIndex: number) => {
    const mealIndex = activePanelIndex.value;
    cateringStore.meals[mealIndex].mealIngredient.splice(index, 1);
    calculateTotalPrice();
};

const addIngredientToMeal = (item: any) => {
    const mealIndex = cateringStore.meals.length - 1;
    console.log(mealIndex);


    const existingIngredient = cateringStore.meals[mealIndex].mealIngredient.find(
        ingredient => ingredient.ingredient.ingredientId === item.ingredient.ingredientId
    );


    let count = 1;

    if (existingIngredient) {
        count = existingIngredient.quantity + 1;
        existingIngredient.quantity = count;
        existingIngredient.totalPrice = item.lastPrice * count;
    } else {
        cateringStore.meals[mealIndex].mealIngredient.push({
            mealId: mealIndex,
            ingredient: { ...item.ingredient },
            quantity: count,
            totalPrice: item.lastPrice * count,
            type: type.value,
        });
    }

    const total = cateringStore.meals[mealIndex].mealIngredient.reduce((sum, ingredient) => {
        return sum + ingredient.totalPrice;
    }, 0);

    cateringStore.meals[mealIndex].totalPrice = total;
};

watch(selectedTab, () => {
    filterIngredients();
    type.value = selectedTab.value === 'coffee' ? 'coffee' : 'rice';
});

function filterIngredients() {
    if (selectedTab.value === 'coffee') {
        ingredientFilters.value = subIngredientStore.subingredients_coffee.filter(item =>
            item.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
        type.value = 'coffee';
    } else if (selectedTab.value === 'rice') {
        ingredientFilters.value = subIngredientStore.subingredients_rice.filter(item =>
            item.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
        type.value = 'rice';
    }
}
watch(selectedTab, () => {
    filterIngredients();
});
onMounted(async () => {
    await ingredientStore.getIngredients();
    await subIngredientStore.getSubIngredients_coffee();
    await subIngredientStore.getSubIngredients_rice();
    filterIngredients();
    calculateTotalPrice();
});
const calculateTotalPrice = () => {
  totalPrice.value = subIngredientStore.ingredientCheckList.reduce((sum, item) => {
    return sum + (item.lastPrice! * item.count || 0);
  }, 0);
};
watch(
  () => subIngredientStore.ingredientCheckList,
  () => {
    calculateTotalPrice();
  },
  { deep: true }
);
</script>
<style scoped>
.button-full-width {
    width: 100%;
}
</style>
