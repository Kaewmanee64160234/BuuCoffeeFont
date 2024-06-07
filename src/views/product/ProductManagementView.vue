<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import { computed, onMounted, ref, watch } from 'vue';
import CreateProductDialog from '../../components/products/CreateProductDialog.vue';
import UpdateProductDialog from '../../components/products/UpdateProductDialog.vue';
import { useIngredientStore } from '@/stores/Ingredient.store';
import type { Product } from '@/types/product.type';
import type { IngredientQuantities } from '@/types/productType.type';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const url = import.meta.env.VITE_URL_PORT;
const paginate = ref(true);
const selectedCategory = ref(categoryStore.selectedCategory);
const ingredientStore = useIngredientStore();

onMounted(async () => {
  await productStore.getAllProducts();
  await categoryStore.getAllCategories();
  await ingredientStore.getAllIngredients();
});

const openCreateDialog = () => {
  productStore.createProductDialog = true;
};

const openUpdateDialog = (product: Product) => {
  productStore.product = { ...product, file: new File([""], "") };
  loadProductData();
  productStore.updateProductDialog = true;
};

const loadProductData = () => {
  const product = productStore.product;

  productStore.productName = product.productName || '';
  productStore.productPrice = product.productPrice || 0;
  productStore.selectedCategory = product.category?.categoryName || null;
  productStore.imagePreview = product.productImage ? `${url}/products/${product.productId}/image` : null;

  if (product.productTypes && Array.isArray(product.productTypes)) {
    product.productTypes.forEach(productType => {
      if (productType.productTypeName === 'Hot') {
        productStore.isHot = true;
        productStore.selectedIngredientsHot = productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [];
        productStore.ingredientQuantitiesHot = productType.recipes?.reduce((acc, recipeItem) => {
          acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
          return acc;
        }, {} as IngredientQuantities) || {};
      }

      if (productType.productTypeName === 'Cold') {
        productStore.isCold = true;
        productStore.selectedIngredientsCold = productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [];
        productStore.ingredientQuantitiesCold = productType.recipes?.reduce((acc, recipeItem) => {
          acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
          return acc;
        }, {} as IngredientQuantities) || {};
      }

      if (productType.productTypeName === 'Blend') {
        productStore.isBlend = true;
        productStore.selectedIngredientsBlend = productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [];
        productStore.ingredientQuantitiesBlend = productType.recipes?.reduce((acc, recipeItem) => {
          acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
          return acc;
        }, {} as IngredientQuantities) || {};
      }

      productStore.productTypes.push({
        productTypeName: productType.productTypeName,
        productTypePrice: productType.productTypePrice,
        selectedIngredients: productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [],
        ingredientQuantities: productType.recipes?.reduce((acc, recipeItem) => {
          acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
          return acc;
        }, {} as IngredientQuantities) || {},
        recipes: productType.recipes || []
      });
    });
  } else {
    productStore.productTypes = [];
  }

  console.log(productStore.productTypes);
  console.log(productStore.productName);
  console.log(productStore.productPrice);
  console.log(productStore.selectedCategory);
  console.log(productStore.imagePreview);
  console.log(productStore.isHot);
  console.log(productStore.selectedIngredientsHot);
  console.log(productStore.ingredientQuantitiesHot);
  console.log(productStore.isCold);
  console.log(productStore.selectedIngredientsCold);
  console.log(productStore.ingredientQuantitiesCold);
  console.log(productStore.isBlend);
  console.log(productStore.selectedIngredientsBlend);
  console.log(productStore.ingredientQuantitiesBlend);
};


</script>

<template>
  <CreateProductDialog />
  <UpdateProductDialog />
  <v-container v-if="paginate">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            Products
          </v-col>
          <v-col cols="3">
            <v-text-field v-model="productStore.searchQuery" label="Search" append-inner-icon="mdi-magnify" hide-details
              dense></v-text-field>
          </v-col>
          <v-col>
            <v-btn @click="openCreateDialog" color="success">
              <v-icon left>mdi-plus</v-icon>
              Add New Product
            </v-btn>
          </v-col>
          <v-col cols="3">
            <v-select v-model="categoryStore.selectedCategory" label="Select Category"
              :items="categoryStore.categories.map(category => category.categoryName)" dense></v-select>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th></th>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr style="text-align: center" v-for="(item, index) in productStore.products" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <v-avatar size="80"><v-img :src="`${url}/products/${item.productId}/image`"></v-img></v-avatar>
            </td>
            <td>{{ item.productName }}</td>
            <td>{{ item.category.categoryName }}</td>
            <td>{{ item.productPrice }}</td>
            <td>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil" @click="openUpdateDialog(item)"></v-btn>
              <v-btn color="#F55050" class="mr-5" icon="mdi-delete"></v-btn>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!productStore.products">
          <tr>
            <td colspan="7" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
  <v-container v-else>
    <v-card>
      <v-card-title>
        <div class="row">
          <div class="col-md-9">
            Products
          </div>
          <v-spacer></v-spacer>
        </div>
      </v-card-title>
      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th></th>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Price</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr style="text-align: center" v-for="(item, index) in productStore.products" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <v-avatar size="80"><v-img :src="`${url}/products/image/${item.productId}`"></v-img></v-avatar>
            </td>
            <td>{{ item.productName }}</td>
            <td>{{ item.category.categoryName }}</td>
            <td>{{ item.productPrice }}</td>
            <td>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil" @click="openUpdateDialog(item)"></v-btn>
              <v-btn color="#F55050" class="mr-5" icon="mdi-delete"></v-btn>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!productStore.products">
          <tr>
            <td colspan="7" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
