<template>
  <v-dialog v-model="productStore.createProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">Create Product</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-file-input v-model="productImage" label="Product image" prepend-icon="mdi-camera" accept="image/*" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="productName" label="Product name" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="productPrice" label="Price" type="number" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="productStore.product.category.categoryName"
                  :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                  label="Select Category" dense @change="checkCategory"></v-select>
              </v-col>
            </v-row>

            <v-row v-if="isDrink">
              <v-row class="d-flex justify-space-between">
                <v-checkbox label="Hot" v-model="productTypes.hot"
                  @change="handleProductTypeChange('Hot', productTypes.hot)"></v-checkbox>
                <v-checkbox label="Cold" v-model="productTypes.cold"
                  @change="handleProductTypeChange('Cold', productTypes.cold)"></v-checkbox>
                <v-checkbox label="Blend" v-model="productTypes.blend"
                  @change="handleProductTypeChange('Blend', productTypes.blend)"></v-checkbox>
              </v-row>

              <v-container v-for="(type, index) in productDetails" :key="index">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>{{ type.productTypeName }}</v-subheader>
                    <v-text-field v-model="type.productTypePrice" label="Type price" type="number" required />
                  </v-col>
                  <v-col cols="12">
                    <v-table>
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="ingredient in ingredientStore.ingredients" :key="ingredient.IngredientId">
                          <td>
                            <v-checkbox :value="ingredient.IngredientId" v-model="type.selectedIngredients"
                              @change="() => handleIngredientSelect(type, ingredient)"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.IngredientId}/image`"
                              height="100"></v-img>
                          </td>
                          <td>{{ ingredient.nameIngredient }}</td>
                          <td>
                            <v-text-field v-model="type.ingredientQuantities[ingredient.IngredientId]" type="number"
                              min="0" label="Quantity"
                              v-if="type.selectedIngredients.includes(ingredient.IngredientId)"></v-text-field>
                          </td>
                          <td>{{ ingredient.unit }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
              </v-container>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="productStore.createProductDialog = false">Close</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useProductStore } from '@/stores/product.store';
import type { Ingredient } from '@/types/ingredient.type';
import type { ProductType } from '@/types/productType.type';
import { ref, reactive, onMounted, watch } from 'vue';

interface IngredientQuantities {
  [key: number]: number;
}

interface CustomProductType extends ProductType {
  selectedIngredients: number[];
  ingredientQuantities: IngredientQuantities;
}

const dialog = ref(false);
const form = ref(null);
const valid = ref(false);
const productName = ref('');
const productPrice = ref(0);
const productImage = ref('');
const selectedCategory = ref(null);
const productStore = useProductStore();
const isDrink = ref(false);
const productDetails = ref<CustomProductType[]>([]);
const categoryStore = useCategoryStore();
const ingredientStore = useIngredientStore();
const productTypes = reactive({
  hot: false,
  cold: false,
  blend: false
});

watch(() => productStore.product.category.categoryName, (newVal) => {
  isDrink.value = newVal === "เครื่องดื่ม";
  checkCategory();
  if (!isDrink.value) {
    productTypes.hot = false;
    productTypes.cold = false;
    productTypes.blend = false;
    productDetails.value = [];
  } else {
    // Ensure we have a clean state for drink products
    if (productTypes.hot) handleProductTypeChange('Hot', true);
    if (productTypes.cold) handleProductTypeChange('Cold', true);
    if (productTypes.blend) handleProductTypeChange('Blend', true);
  }
});

onMounted(async () => {
  await categoryStore.getAllCategories();
  await ingredientStore.getAllIngredients();
});

const handleProductTypeChange = (type: string, isChecked: boolean) => {
  const typeIndex = productDetails.value.findIndex(pt => pt.productTypeName === type);
  if (isChecked && typeIndex === -1) {
    productDetails.value.push({
      productTypeName: type,
      productTypePrice: 5,
      selectedIngredients: [] as number[],
      ingredientQuantities: reactive({}) as IngredientQuantities,
      recipe: []
    });
  } else if (!isChecked && typeIndex !== -1) {
    productDetails.value.splice(typeIndex, 1);
  }
  console.log(`Product Details for ${type}:`, productDetails.value);
};

const handleIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = type.selectedIngredients.indexOf(ingredient.IngredientId);
  if (index === -1) {
    type.selectedIngredients.push(ingredient.IngredientId);
    type.ingredientQuantities[ingredient.IngredientId] = 0;
  } else {
    type.selectedIngredients.splice(index, 1);
    delete type.ingredientQuantities[ingredient.IngredientId];
  }
  console.log(`Selected Ingredients for ${type.productTypeName}:`, JSON.parse(JSON.stringify(type.selectedIngredients)));
  console.log(`Ingredient Quantities for ${type.productTypeName}:`, JSON.parse(JSON.stringify(type.ingredientQuantities)));
};

const checkCategory = () => {
  isDrink.value = productStore.product.category.categoryName === "เครื่องดื่ม";
};

const submitForm = () => {
  if (!form.value.validate()) return;

  const productData = {
    productName: productName.value,
    productPrice: productPrice.value,
    productImage: productImage.value,
    categoryId: selectedCategory.value,
    productTypes: productDetails.value.map(type => ({
      productTypeName: type.productTypeName,
      productTypePrice: type.productTypePrice,
      recipes: type.selectedIngredients.map(ingredientId => ({
        ingredientId,
        quantity: type.ingredientQuantities[ingredientId]
      }))
    }))
  };

  console.log('Product Data:', JSON.parse(JSON.stringify(productData)));
  dialog.value = false; // Close dialog after submit
};
</script>
