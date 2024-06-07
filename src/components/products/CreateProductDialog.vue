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
                <v-file-input v-model="productImage" label="Product image" prepend-icon="mdi-camera" accept="image/*" @change="handleImageUpload" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-img v-if="imagePreview" :src="imagePreview" max-height="200"></v-img>
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
                  @change="() => handleProductTypeChange('Hot', productTypes.hot)"></v-checkbox>
                <v-checkbox label="Cold" v-model="productTypes.cold"
                  @change="() => handleProductTypeChange('Cold', productTypes.cold)"></v-checkbox>
                <v-checkbox label="Blend" v-model="productTypes.blend"
                  @change="() => handleProductTypeChange('Blend', productTypes.blend)"></v-checkbox>
              </v-row>

              <v-container v-for="(type, index) in productDetails" :key="index">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>{{ type.productTypeName }}</v-subheader>
                    <v-text-field v-model="type.productTypePrice" label="Type price" type="number" required />
                  </v-col>
                  <v-col cols="12">
                    <v-btn icon @click="() => addRecipe(type)">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
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
                            <v-checkbox v-if="type.productTypeName === 'Hot'" v-model="type.selectedIngredients"
                              :value="ingredient.IngredientId"
                              @change="() => handleHotIngredientSelect(type, ingredient)"></v-checkbox>
                            <v-checkbox v-if="type.productTypeName === 'Cold'" v-model="type.selectedIngredients"
                              :value="ingredient.IngredientId"
                              @change="() => handleColdIngredientSelect(type, ingredient)"></v-checkbox>
                            <v-checkbox v-if="type.productTypeName === 'Blend'" v-model="type.selectedIngredients"
                              :value="ingredient.IngredientId"
                              @change="() => handleBlendIngredientSelect(type, ingredient)"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.IngredientId}/image`"
                              height="100"></v-img>
                          </td>
                          <td>{{ ingredient.nameIngredient }}</td>
                          <td>
                            <v-text-field
                              v-if="type.productTypeName === 'Hot' && selectedIngredientsHot.includes(ingredient.IngredientId)"
                              v-model="ingredientQuantitiesHot[ingredient.IngredientId]" type="number" min="0"
                              label="Quantity"></v-text-field>
                            <v-text-field
                              v-if="type.productTypeName === 'Cold' && selectedIngredientsCold.includes(ingredient.IngredientId)"
                              v-model="ingredientQuantitiesCold[ingredient.IngredientId]" type="number" min="0"
                              label="Quantity"></v-text-field>
                            <v-text-field
                              v-if="type.productTypeName === 'Blend' && selectedIngredientsBlend.includes(ingredient.IngredientId)"
                              v-model="ingredientQuantitiesBlend[ingredient.IngredientId]" type="number" min="0"
                              label="Quantity"></v-text-field>
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
        <v-btn color="blue darken-1" @click="clearData()">Cancel</v-btn>
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
const productImage = ref(new File([], ''));
const imagePreview = ref<string | null>(null);
const selectedCategory = ref(null);
const productStore = useProductStore();
const isDrink = ref(false);
const productDetails = ref<CustomProductType[]>([]);
const categoryStore = useCategoryStore();
const ingredientStore = useIngredientStore();
const selectedIngredientsHot = ref<number[]>([]);
const selectedIngredientsCold = ref<number[]>([]);
const selectedIngredientsBlend = ref<number[]>([]);
const ingredientQuantitiesHot = ref<IngredientQuantities>({});
const ingredientQuantitiesCold = ref<IngredientQuantities>({});
const ingredientQuantitiesBlend = ref<IngredientQuantities>({});
const productTypes = reactive({
  hot: false,
  cold: false,
  blend: false
});

watch(() => productStore.product.category.categoryName, (newVal) => {
  isDrink.value = newVal === "เครื่องดื่ม";
  if (!isDrink.value) {
    productTypes.hot = false;
    productTypes.cold = false;
    productTypes.blend = false;
    productDetails.value = [];
  }
});

onMounted(async () => {
  await categoryStore.getAllCategories();
  await ingredientStore.getAllIngredients();
});

const handleProductTypeChange = (type: string, isChecked: boolean) => {
  const typeIndex = productDetails.value.findIndex(pt => pt.productTypeName === type);
  console.log('Type Index:', typeIndex);
  if (isChecked && typeIndex === -1) {
    productDetails.value.push({
      productTypeName: type,
      productTypePrice: 5,
      selectedIngredients: [] as number[],
      ingredientQuantities: reactive({}) as IngredientQuantities,
      recipes: []
    });
  } else if (!isChecked && typeIndex !== -1) {
    productDetails.value.splice(typeIndex, 1);
  }
  console.log(`Product Details for ${type}:`, JSON.parse(JSON.stringify(productDetails.value)));
};

const handleHotIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = selectedIngredientsHot.value.findIndex(id => id === ingredient.IngredientId);
  console.log('Index:', index);
  if (index === -1) {
    selectedIngredientsHot.value.push(ingredient.IngredientId);
    ingredientQuantitiesHot.value[ingredient.IngredientId] = 0;
  } else {
    selectedIngredientsHot.value.splice(index, 1);
    delete ingredientQuantitiesHot.value[ingredient.IngredientId];
  }
  console.log('Selected Ingredients for Hot:', JSON.parse(JSON.stringify(selectedIngredientsHot.value)));
  console.log('Ingredient Quantities for Hot:', JSON.parse(JSON.stringify(ingredientQuantitiesHot.value)));
};

const handleColdIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = selectedIngredientsCold.value.findIndex(id => id === ingredient.IngredientId);
  console.log('Index:', index);
  if (index === -1) {
    selectedIngredientsCold.value.push(ingredient.IngredientId);
    ingredientQuantitiesCold.value[ingredient.IngredientId] = 0;
  } else {
    selectedIngredientsCold.value.splice(index, 1);
    delete ingredientQuantitiesCold.value[ingredient.IngredientId];
  }
  console.log('Selected Ingredients for Cold:', JSON.parse(JSON.stringify(selectedIngredientsCold.value)));
  console.log('Ingredient Quantities for Cold:', JSON.parse(JSON.stringify(ingredientQuantitiesCold.value)));
};

const handleBlendIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = selectedIngredientsBlend.value.findIndex(id => id === ingredient.IngredientId);
  console.log('Index:', index);
  if (index === -1) {
    selectedIngredientsBlend.value.push(ingredient.IngredientId);
    ingredientQuantitiesBlend.value[ingredient.IngredientId] = 0;
  } else {
    selectedIngredientsBlend.value.splice(index, 1);
    delete ingredientQuantitiesBlend.value[ingredient.IngredientId];
  }
  console.log('Selected Ingredients for Blend:', JSON.parse(JSON.stringify(selectedIngredientsBlend.value)));
  console.log('Ingredient Quantities for Blend:', JSON.parse(JSON.stringify(ingredientQuantitiesBlend.value)));
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    productImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const addRecipe = (type: CustomProductType) => {
  type.recipes.push({ ingredient: {} as Ingredient, quantity: 0 });
};

const checkCategory = () => {
  isDrink.value = productStore.product.category.categoryName === "เครื่องดื่ม";
};

const submitForm = async () => {
  if (!form.value.validate()) return;
  if (! productStore.product.category.categoryName) {
    alert('Please select a valid category.');
    return;
  }

  // productName.value
  if(!productName.value) {
    alert('Please enter a product name.');
    return;
  }

  // productPrice.value
  if(productPrice.value <= 0) {
    alert('Please enter a valid product price.');
    return;
  }

  // selectedCategory.value
  if(!productStore.product.category.categoryName) {
    alert('Please select a category.');
    return;
  }


  const productData = {
    productName: productName.value,
    productPrice: productPrice.value,
    productImage: productImage.value,
    categoryId: selectedCategory.value,
    productTypes: [] as ProductType[]
  };
  
  if (isDrink.value) {
    const hotSelected = selectedIngredientsHot.value.length > 0;
    const coldSelected = selectedIngredientsCold.value.length > 0;
    const blendSelected = selectedIngredientsBlend.value.length > 0;

    if (!hotSelected && !coldSelected && !blendSelected) {
      alert('Please select at least one product type for drinks.');
      return;
    }

    for (const ingredientId of selectedIngredientsHot.value) {
      if (ingredientQuantitiesHot.value[ingredientId] <= 0) {
        alert('Ingredient quantities for Hot must be greater than zero.');
        return;
      }
    }
    for (const ingredientId of selectedIngredientsCold.value) {
      if (ingredientQuantitiesCold.value[ingredientId] <= 0) {
        alert('Ingredient quantities for Cold must be greater than zero.');
        return;
      }
    }
    for (const ingredientId of selectedIngredientsBlend.value) {
      if (ingredientQuantitiesBlend.value[ingredientId] <= 0) {
        alert('Ingredient quantities for Blend must be greater than zero.');
        return;
      }
    }

    if (selectedIngredientsHot.value.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Hot',
        productTypePrice: 0,
        recipes: selectedIngredientsHot.value.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: ingredientQuantitiesHot.value[ingredientId]
          };
        })
      });
    }
    if (selectedIngredientsCold.value.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Cold',
        productTypePrice: 0,
        recipes: selectedIngredientsCold.value.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: ingredientQuantitiesCold.value[ingredientId]
          };
        })
      });
    }
    if (selectedIngredientsBlend.value.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Blend',
        productTypePrice: 0,
        recipes: selectedIngredientsBlend.value.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: ingredientQuantitiesBlend.value[ingredientId]
          };
        })
      });
    }
  }

  console.log('Product Data:', JSON.parse(JSON.stringify(productData)));
  productStore.product = {
    category: categoryStore.categories.find(c => c.categoryName === productStore.product.category.categoryName)!,
    productName: productData.productName,
    productPrice: productData.productPrice,
    productImage: '',
    productTypes: productData.productTypes,
    productId: 0,
    file: productImage.value
  };
  console.log('Product:', JSON.parse(JSON.stringify(productStore.product)));
  await productStore.createProduct();
  clearData();
};

// clearData and close dialog
const clearData = () => {
  productName.value = '';
  productPrice.value = 0;
  productImage.value = new File([], '');
  imagePreview.value = null;
  selectedCategory.value = null;
  productTypes.hot = false;
  productTypes.cold = false;
  productTypes.blend = false;
  productDetails.value = [];
  selectedIngredientsHot.value = [];
  selectedIngredientsCold.value = [];
  selectedIngredientsBlend.value = [];
  ingredientQuantitiesHot.value = {};
  ingredientQuantitiesCold.value = {};
  ingredientQuantitiesBlend.value = {};
  productStore.createProductDialog = false;
};

</script>
