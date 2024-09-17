<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import SelectedItemsListCatering from '@/components/pos/SelectedItemsListCatering.vue';
import DrinkSelectionDialog from '@/components/pos/DrinkSelectionDialog.vue';
import ReceiptDialog from '@/components/pos/ReceiptDialog.vue';
import { useCategoryStore } from '@/stores/category.store';
import { usePosStore } from '@/stores/pos.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import subInventoryCard from '@/components/subInvertory/subInventoryCard.vue';
import { useSubIngredientStore } from '@/stores/ingredientSubInventory.store';
import type { SubInventoriesCoffee } from '@/types/subinventoriescoffee.type';

const categoryStore = useCategoryStore();
const subInventoryStore = useSubIngredientStore();
const posStore = usePosStore();
const ingredientStore = useIngredientStore();
const typeStock = ref<string>('');

const selectedCategory = ref<string>('วัตถุดิบร้านกาแฟ');
const ingredientFilters = ref<SubInventoriesCoffee[]>([]);
const searchQuery = ref('');

onMounted(async () => {
    ingredientFilters.value = [];
    await categoryStore.getAllCategories();
    await subInventoryStore.getSubIngredients_coffee();
    await subInventoryStore.getSubIngredients_rice();

    // Ensure the additional categories are included
    categoryStore.categoriesForCreate = [
        {
            categoryId: 101,
            categoryName: 'วัตถุดิบร้านกาแฟ',
        },
        {
            categoryId: 100,
            categoryName: 'วัตถุดิบร้านข้าว',
        },
    ];

    await ingredientStore.getIngredients();
    filterIngredients();
});

watch(selectedCategory, () => {
    filterIngredients();
});

watch(searchQuery, () => {
    filterIngredients();
});

const filterIngredients = () => {
    ingredientFilters.value = [];
    if (selectedCategory.value === 'วัตถุดิบร้านกาแฟ') {
        ingredientFilters.value = subInventoryStore.subingredients_coffee
            .filter((ingredient: SubInventoriesCoffee) => ingredient.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase()));
        typeStock.value = 'coffee';
    } else if (selectedCategory.value === 'วัตถุดิบร้านข้าว') {
        ingredientFilters.value = subInventoryStore.subingredients_rice
            .filter((ingredient: SubInventoriesCoffee) => ingredient.ingredient.ingredientName!.toLowerCase().includes(searchQuery.value.toLowerCase()));
        typeStock.value = 'rice';
    }
};

const addToCart = (item: any) => {
    posStore.addToReceipt(item, null, [], 1, null);
};
</script>

<template>
    <v-app style="width: 100vw; height: 100vh; overflow: hidden;">
        <v-row :style="{ height: '100%' }">
            <v-col cols="7" class="d-flex flex-column align-center"
                style="background-color: #f7f7f7; height: 100%; overflow: hidden;">
                <v-container fluid class="full-width-container"
                    style="height: 100%; overflow: hidden; margin-left: 6%;">
                    <v-row class="full-width-row" style="margin-bottom: 10px;">
                        <v-col cols="12">
                            <v-text-field v-model="searchQuery" append-icon="mdi-magnify" label="ค้นหา" variant="solo"
                                dense hide-details
                                style="background-color: #f1f1f1; border-radius: 8px;"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row class="full-width-row" style="overflow: hidden; margin-bottom: 10px;">
                        <v-col cols="12">
                            <v-tabs v-model="selectedCategory" align-tabs="start" color="brown" class="full-width-tabs"
                                background-color="#fff">
                                <v-tab v-for="category in categoryStore.categoriesForCreate" :key="category.categoryId"
                                    :value="category.categoryName">
                                    {{ category.categoryName }}
                                </v-tab>
                            </v-tabs>
                        </v-col>
                    </v-row>
                    <v-row class="full-width-row product-list-container" style="flex: 1; overflow-y: auto;">
                        <v-tabs-items v-model="selectedCategory" style="width: 100%;">
                            <!-- Ingredient Tab for Coffee -->
                            <v-tab-item value="วัตถุดิบร้านกาแฟ">
                                <v-container fluid class="full-width-container">
                                    <v-row class="full-width-row">
                                        <v-col v-for="ingredient in ingredientFilters" :key="ingredient.subInventoryId"
                                            cols="12" sm="6" md="4" lg="4" class="d-flex">
                                            <div class="ingredient-card">
                                                <subInventoryCard :sub-inventory="ingredient" :type="typeStock" />
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-tab-item>

                            <!-- Ingredient Tab for Rice -->
                            <v-tab-item value="วัตถุดิบร้านข้าว">
                                <v-container fluid class="full-width-container">
                                    <v-row class="full-width-row">
                                        <v-col v-for="ingredient in ingredientFilters" :key="ingredient.subInventoryId"
                                            cols="12" sm="6" md="4" lg="4" class="d-flex">
                                            <div class="ingredient-card">
                                                <subInventoryCard :sub-inventory="ingredient" :type="typeStock" />
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-row>

                </v-container>
            </v-col>
            <v-col cols="5" class="d-flex flex-column" style="height: 100%; padding-top: 20px;">
                <v-sheet style="height: 100%;">
                    <SelectedItemsListCatering></SelectedItemsListCatering>
                </v-sheet>
            </v-col>
        </v-row>
        <receipt-dialog />
    </v-app>
</template>

<style scoped>
.full-width-container,
.full-width-row {
    width: 100%;
    margin: 0;
    padding: 0;
}

.full-width-tabs {
    width: 100%;
}

.product-list-container {
    height: calc(100vh - 250px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
}

.ingredient-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding: 10px;
    border-radius: 10px;
    margin: 10px;
    background-color: #fff;
}

.product-list-container::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

.product-list-container::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.product-list-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
    border: 3px solid #f1f1f1;
}

.product-list-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* Firefox */
.product-list-container {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
}
</style>
