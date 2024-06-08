<template>
  <CreateProductDialog />
  <UpdateProductDialog />
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field 
              v-model="productStore.searchQuery" 
              label="ค้นหาสินค้า" 
              append-inner-icon="mdi-magnify"
              hide-details 
              dense 
              variant="solo"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="12" md="3" class="d-flex justify-center align-center">
            <v-btn @click="openCreateDialog" style="background-color: #8ad879; color: white" block>
              <v-icon left>mdi-plus</v-icon>
              เพิ่มสินค้า
            </v-btn>
          </v-col>
          <v-col cols="12" md="3">
            <v-select 
              v-model="categoryStore.selectedCategory" 
              label="Select Category"
              :items="categoryStore.categories.map(category => category.categoryName)" 
              dense 
              hide-details
              variant="solo"
            ></v-select>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-table class="text-center mt-5" >
          <thead >
            <tr >
              <th style="text-align: center">#</th>
              <th style="text-align: center">Image</th>
              <th style="text-align: center">Name</th>
              <th style="text-align: center">Type</th>
              <th style="text-align: center">Price</th>
              <th style="text-align: center">Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr  v-for="(item, index) in productStore.products" :key="index" style="text-align: center">
              <td>{{ index + 1 }}</td>
              <td>
                <v-avatar size="80">
                  <v-img :src="`${url}/products/${item.productId}/image`"></v-img>
                </v-avatar>
              </td>
              <td>{{ item.productName }}</td>
              <td>{{ item.category.categoryName }}</td>
              <td>{{ item.productPrice }}</td>
              <td>
                <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openUpdateDialog(item)">
                </v-btn>
                <v-btn color="#F55050" icon="mdi-delete" @click="deleteProduct(item.productId)">
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tbody v-if="!productStore.products || productStore.products.length === 0">
            <tr>
              <td colspan="6" class="text-center">No data</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import { onMounted, ref } from 'vue';
import CreateProductDialog from '../../components/products/CreateProductDialog.vue';
import UpdateProductDialog from '../../components/products/UpdateProductDialog.vue';
import { useIngredientStore } from '@/stores/Ingredient.store';
import type { Product } from '@/types/product.type';
import Swal from 'sweetalert2';

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
};

const confirmDelete = async (deleteAction: () => Promise<void>) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    await deleteAction();
    Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
  }
};

const deleteProduct = async (productId: number) => {
  try {
    await confirmDelete(async () => {
      await productStore.deleteProduct(productId);
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    Swal.fire('Error', 'An error occurred while deleting the product.', 'error');
  }
};
</script>
