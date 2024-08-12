<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import ProductCard from '@/components/pos/ProductCard.vue';
import SelectedItemsList from '@/components/pos/SelectedItemsList.vue';
import DrinkSelectionDialog from '@/components/pos/DrinkSelectionDialog.vue';
import ReceiptDialog from '@/components/pos/ReceiptDialog.vue';
import { useProductStore } from '@/stores/product.store';
import { useCategoryStore } from '@/stores/category.store';
import { useToppingStore } from '@/stores/topping.store';
import { useUserStore } from '@/stores/user.store';
import { usePosStore } from '@/stores/pos.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import Swal from 'sweetalert2';
import type { Product } from '@/types/product.type';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const toppingStore = useToppingStore();
const userStore = useUserStore();
const posStore = usePosStore();
const ingredientStore = useIngredientStore();
const selectedCategory = ref<string>(categoryStore.categoriesForCreate[0]?.categoryName || '');
const productFilters = ref<Product[]>([]);
const ingredientFilters = ref<any[]>([]);
const searchQuery = ref('');

// Load products, categories, and ingredients on mount
onMounted(async () => {
    productFilters.value = []
    ingredientFilters.value = []
    productFilters.value = []
    await productStore.getAllProducts();
    await categoryStore.getAllCategories();
    await ingredientStore.getAllIngredients();
    console.log(productStore.products.length);

    filterProducts();

});

// Watch selectedCategory to filter products or show ingredients
watch(selectedCategory, () => {
    productFilters.value = []
    ingredientFilters.value = []
    filterProducts();
    console.log(productFilters.value.length);

});

// Watch searchQuery to filter products or ingredients within the selected category
watch(searchQuery, () => {
    productFilters.value = []
    ingredientFilters.value = []
    filterProducts();
});

const filterProducts = () => {

    if (selectedCategory.value === 'Ingredients') {
        ingredientFilters.value = ingredientStore.ingredients.filter(ingredient =>
            ingredient.ingredientName?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
        productFilters.value = [];
    } else {
        productFilters.value = productStore.products
            .filter(product =>
                product.category.categoryName === selectedCategory.value &&
                product.productName.toLowerCase().includes(searchQuery.value.toLowerCase())
            )
            .reduce((uniqueProducts, currentProduct) => {
                if (!uniqueProducts.some(product => product.productId === currentProduct.productId)) {
                    uniqueProducts.push(currentProduct);
                }
                return uniqueProducts;
            }, [] as Product[]);
        ingredientFilters.value = [];
    }
};

// Add a product to the cart
const addToCart = (product: Product) => {
    posStore.addToReceipt(product, null, [], 1, null);
};
</script>


<template>
    <v-app style="width: 100vw; height: 100vh; overflow: hidden;">
        <v-row :style="{ height: '100%' }">
            <!-- Main Interface Column -->
            <v-col cols="7" class="d-flex flex-column align-center"
                style="background-color: #f7f7f7; height: 100%; overflow: hidden;">
                <v-container fluid class="full-width-container"
                    style="height: 100%; overflow: hidden; margin-left: 6%;">

                    <!-- Category Tabs -->
                    <v-row class="full-width-row" style="overflow: hidden; margin-bottom: 10px;">
                        <v-col cols="12">
                            <v-tabs v-model="selectedCategory" align-tabs="start" color="brown" class="full-width-tabs"
                                background-color="#fff">
                                <v-tab value="Ingredients">Ingredients</v-tab>
                                <v-tab v-for="category in categoryStore.categoriesForCreate" :key="category.categoryId"
                                    :value="category.categoryName">
                                    {{ category.categoryName }}
                                </v-tab>
                            </v-tabs>
                        </v-col>
                    </v-row>

                    <!-- Product/Ingredient List -->
                    <v-row class="full-width-row product-list-container" style="flex: 1; overflow-y: auto;">
                        <v-tabs-items v-model="selectedCategory" style="width: 100%;">

                            <!-- Ingredients Tab -->
                            <v-tab-item value="Ingredients">
                                <v-container>
                                    <v-row>
                                        <v-col cols="3" style="text-align: center; padding: 8px;"
                                            v-for="(item, index) in ingredientFilters" :key="index">
                                            <v-card width="100%" @click="ingredientStore.Addingredient(item)"
                                                style="height: 200px;">
                                                <v-img
                                                    :src="`http://localhost:3000/ingredients/${item.ingredientId}/image`"
                                                    height="100"></v-img>
                                                <v-card-title style="font-size: 14px;">{{ item.ingredientName
                                                    }}</v-card-title>
                                                <v-card-subtitle style="font-size: 12px;">{{ item.ingredientSupplier
                                                    }}</v-card-subtitle>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-tab-item>

                            <!-- Products Tab -->
                                <v-tabs-items v-model="selectedCategory" style="width: 100%;">
                                    <v-tab-item>
                                        <v-container fluid class="full-width-container">
                                            <v-row class="full-width-row">
                                                <v-col v-for="product in productFilters" :key="product.productId"
                                                    cols="12" sm="6" md="4" lg="3" class="d-flex">
                                                    <product-card :product="product"
                                                        class="product-card"></product-card>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-tab-item>
                                </v-tabs-items>

                        </v-tabs-items>
                    </v-row>

                    <!-- Drink Selection Dialog -->
                    <drink-selection-dialog></drink-selection-dialog>
                </v-container>
            </v-col>

            <!-- Selected Items List -->
            <v-col cols="5" class="d-flex flex-column" style="height: 100%; padding-top: 20px;">
                <v-sheet style="height: 100%;">
                    <selected-items-list></selected-items-list>
                </v-sheet>
            </v-col>
        </v-row>

        <!-- Receipt Dialog -->
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
    /* Adjust based on the height of other elements */
    overflow-y: auto;
    scrollbar-width: thin;
    /* Firefox */
    scrollbar-color: #888 #f1f1f1;
    /* Customize scrollbar colors */
}

.product-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin: 10px;
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    background-color: #fff;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
}

.text-center {
    text-align: center;
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

/* Edge, IE 10+ */
.product-list-container::-ms-scrollbar {
    width: 12px;
    height: 12px;
}

.product-list-container::-ms-scrollbar-track {
    background: #f1f1f1;
}

.product-list-container::-ms-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
    border: 3px solid #f1f1f1;
}

.product-list-container::-ms-scrollbar-thumb:hover {
    background: #555;
}
</style>