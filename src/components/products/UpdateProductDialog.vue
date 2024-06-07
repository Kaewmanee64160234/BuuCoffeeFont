
<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useProductStore } from '@/stores/product.store';
import type { Ingredient } from '@/types/ingredient.type';
import type { ProductType } from '@/types/productType.type';
import { ref, reactive, onMounted, watch } from 'vue';
import axios from 'axios';

interface IngredientQuantities {
  [key: number]: number;
}

interface CustomProductType extends ProductType {
  selectedIngredients: number[];
  ingredientQuantities: IngredientQuantities;
}

const form = ref(null);
const valid = ref(false);
const productName = ref('');
const productPrice = ref(0);
const productImage = ref(new File([], ''));
const imagePreview = ref<string | null>(null);
const selectedCategory = ref('');
const url = import.meta.env.VITE_URL_PORT;
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
const isHot = ref(false);
const isCold = ref(false);
const isBlend = ref(false);

watch(() => productStore.product.category.categoryName, (newVal) => {
  isDrink.value = newVal === "เครื่องดื่ม";
  if (!isDrink.value) {
    isHot.value = false;
    isCold.value = false;
    isBlend.value = false;
    productDetails.value = [];
  }
});

onMounted(async () => {
  await categoryStore.getAllCategories();
  await ingredientStore.getAllIngredients();
  loadProductData();
});

const loadProductData = () => {
  const product = productStore.product;

  productName.value = product.productName;
  productPrice.value = product.productPrice;
  selectedCategory.value = product.category.categoryName;
  imagePreview.value = product.productImage ? `${import.meta.env.VITE_URL_PORT}/products/${product.productId}/image` : null;

  product.productTypes.forEach((productType) => {
    productDetails.value.push({
      productTypeName: productType.productTypeName,
      productTypePrice: productType.productTypePrice,
      selectedIngredients: productType.recipes.map((recipesItem) => recipesItem.ingredient.IngredientId),
      ingredientQuantities: productType.recipes.reduce((acc, recipesItem) => {
        acc[recipesItem.ingredient.IngredientId] = recipesItem.quantity;
        return acc;
      }, {} as IngredientQuantities),
      recipes: productType.recipes
    });

    if (productType.productTypeName === 'Hot') {
      isHot.value = true;
      productStore.selectedIngredientsHot = productDetails.value.find(pt => pt.productTypeName === 'Hot')?.selectedIngredients || [];
      ingredientQuantitiesHot.value = productDetails.value.find(pt => pt.productTypeName === 'Hot')?.ingredientQuantities || {};
    }

    if (productType.productTypeName === 'Cold') {
      isCold.value = true;
      productStore.selectedIngredientsCold = productDetails.value.find(pt => pt.productTypeName === 'Cold')?.selectedIngredients || [];
      ingredientQuantitiesCold.value = productDetails.value.find(pt => pt.productTypeName === 'Cold')?.ingredientQuantities || {};
    }

    if (productType.productTypeName === 'Blend') {
      isBlend.value = true;
      productStore.selectedIngredientsBlend = productDetails.value.find(pt => pt.productTypeName === 'Blend')?.selectedIngredients || [];
      ingredientQuantitiesBlend.value = productDetails.value.find(pt => pt.productTypeName === 'Blend')?.ingredientQuantities || {};
    }
  });
};

const handleProductTypeChange = (type: string, isChecked: boolean) => {
  const typeIndex = productStore.productTypes.findIndex(pt => pt.productTypeName === type);
  console.log('Type index:', typeIndex);
  if (isChecked && typeIndex === -1) {
    productStore.productTypes.push({
      productTypeName: type,
      productTypePrice: 5,
      selectedIngredients: [] as number[],
      ingredientQuantities: reactive({}) as IngredientQuantities,
      recipes: []
    });
  } else if (!isChecked && typeIndex !== -1) {
    productStore.productTypes.splice(typeIndex, 1);
    // check type and clare selectedIngredients and ingredientQuantities
    if (type === 'Hot') {
      productStore.selectedIngredientsHot = [];
      ingredientQuantitiesHot.value = {};
    } else if (type === 'Cold') {
      productStore.selectedIngredientsCold = [];
      ingredientQuantitiesCold.value = {};
    } else if (type === 'Blend') {
      productStore.selectedIngredientsBlend = [];
      ingredientQuantitiesBlend.value = {};
    }
    
  }
};

const handleHotIngredientSelect = ( ingredient: Ingredient) => {
  const index = productStore.selectedIngredientsHot.findIndex(id => id === ingredient.IngredientId);
  if (index === -1) {
    productStore.selectedIngredientsHot.push(ingredient.IngredientId);
    ingredientQuantitiesHot.value[ingredient.IngredientId] = 0;
  } else {
    productStore.selectedIngredientsHot.splice(index, 1);
    delete ingredientQuantitiesHot.value[ingredient.IngredientId];
  }
};

const handleColdIngredientSelect = (ingredient: Ingredient) => {
  const index = productStore.selectedIngredientsCold.findIndex(id => id === ingredient.IngredientId);
  if (index === -1) {
    productStore.selectedIngredientsCold.push(ingredient.IngredientId);
    ingredientQuantitiesCold.value[ingredient.IngredientId] = 0;
  } else {
    productStore.selectedIngredientsCold.splice(index, 1);
    delete ingredientQuantitiesCold.value[ingredient.IngredientId];
  }
};

const handleBlendIngredientSelect = ( ingredient: Ingredient) => {
  const index = productStore.selectedIngredientsBlend.findIndex(id => id == ingredient.IngredientId);
  if (index === -1) {
    productStore.selectedIngredientsBlend.push(ingredient.IngredientId);
    ingredientQuantitiesBlend.value[ingredient.IngredientId] = 0;
  } else {
    productStore.selectedIngredientsBlend.splice(index, 1);
    delete ingredientQuantitiesBlend.value[ingredient.IngredientId];
  }
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    productImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};


const checkCategory = () => {
  isDrink.value = productStore.product.category.categoryName === "เครื่องดื่ม";
};

const submitForm = async () => {
  if (!form.value.validate()) return;

  const productData = {
    productName: productStore.productName,
    productPrice: productStore.productPrice,
    productImage: productStore.product.productImage,
    categoryId: categoryStore.categoriesForCreate.find(category => category.categoryName === selectedCategory.value)?.categoryId || null,
    productTypes: [] as ProductType[] // Ensure productTypes is initialized
  };

  if (isDrink.value) {
   
    if (productStore.selectedIngredientsHot.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Hot',
        productTypePrice: 0,
        recipes: productStore.selectedIngredientsHot.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: productStore.ingredientQuantitiesHot[ingredientId]
          };
        })
      });
    }
    if (productStore.selectedIngredientsCold.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Cold',
        productTypePrice: 0,
        recipes: productStore.selectedIngredientsCold.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: productStore.ingredientQuantitiesCold[ingredientId]
          };
        })
      });
    }
    if (productStore.selectedIngredientsBlend.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Blend',
        productTypePrice: 0,
        recipes: productStore.selectedIngredientsBlend.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: productStore.ingredientQuantitiesBlend[ingredientId]
          };
        })
      });
    }
    console.log('Product productTypes:', productData.productTypes);
  }

  try {
  productStore.product = {
    category: categoryStore.categories.find(c => c.categoryName === productStore.product.category.categoryName)!,
    productName: productData.productName,
    productPrice: productData.productPrice,
    productImage: '',
    productTypes: productData.productTypes,
    productId: productStore.product.productId,
    file: productImage.value
  };
  console.log('Product:', JSON.stringify(productStore.product));
  await productStore.updateProduct(productStore.product.productId, productStore.product);
  productStore.updateProductDialog = false;
} catch (error) {
  console.error('Error updating product:', error);
}

};
</script>

<template>
  <v-dialog v-model="productStore.updateProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">Update Product</span>
      </v-card-title>
      <v-card-text>
      
        <!-- {{ productStore.product}} -->
        <!-- {{ productStore.productName}}
        {{ productStore.productPrice}}
        {{ productStore.selectedCategory}}
        {{ productStore.imagePreview}}
        {{ productStore.productTypes}} -->
        {{ productStore.isHot}}
        {{ productStore.isCold}}
        {{ productStore.isBlend}}
        {{ productStore.selectedIngredientsHot}}
        {{ productStore.selectedIngredientsCold}}
        {{ productStore.selectedIngredientsBlend}}
        {{ productStore.ingredientQuantitiesHot}}
        {{ productStore.ingredientQuantitiesCold}}
        {{ productStore.ingredientQuantitiesBlend}}
       


        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-file-input v-model="productImage" label="Product image" prepend-icon="mdi-camera" accept="image/*" @change="handleImageUpload" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-img  :src="`${productStore.imagePreview}`" max-height="200"/>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="productStore.productName" label="Product name" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="productStore.productPrice" label="Price" type="number" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="productStore.selectedCategory"
                  :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                  label="Select Category" dense @change="checkCategory"></v-select>
              </v-col>
            </v-row>

            <v-row v-if="isDrink">
              <v-row class="d-flex justify-space-between">
                <v-checkbox label="Hot" v-model="productStore.isHot" @change="() => handleProductTypeChange('Hot', isHot)"></v-checkbox>
                <v-checkbox label="Cold" v-model="productStore.isCold" @change="() => handleProductTypeChange('Cold', isCold)"></v-checkbox>
                <v-checkbox label="Blend" v-model="productStore.isBlend" @change="() => handleProductTypeChange('Blend', isBlend)"></v-checkbox>
              </v-row>

              <!-- container for hot -->
              <v-container v-if="productStore.isHot">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Hot</v-subheader>
                    <v-text-field v-model="productStore.productTypes[0].productTypePrice" label="Type price" type="number" required />
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
                            <v-checkbox v-model="productStore.selectedIngredientsHot" :value="ingredient.IngredientId" @change="() => handleHotIngredientSelect( ingredient)"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.IngredientId}/image`" height="100"></v-img>
                          </td>
                          <td>{{ ingredient.nameIngredient }}</td>
                          <td>
                            <v-text-field v-if="productStore.selectedIngredientsHot.includes(ingredient.IngredientId)" v-model="productStore.ingredientQuantitiesHot[ingredient.IngredientId]" type="number" min="0" label="Quantity"></v-text-field>
                          </td>
                          <td>{{ ingredient.unit }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
              </v-container>

              <!-- container for cold -->

              <v-container v-if="productStore.isCold">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Cold</v-subheader>
                    <v-text-field v-model="productStore.productTypes[1].productTypePrice" label="Type price" type="number" required />
                  </v-col>
                  <v-col cols="12">
                  
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
                            <v-checkbox v-model="productStore.selectedIngredientsCold" :value="ingredient.IngredientId" @change="() => handleColdIngredientSelect( ingredient)"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.IngredientId}/image`" height="100"></v-img>
                          </td>
                          <td>{{ ingredient.nameIngredient }}</td>
                          <td>
                            <v-text-field v-if="productStore.selectedIngredientsCold.includes(ingredient.IngredientId)" v-model="productStore.ingredientQuantitiesCold[ingredient.IngredientId]" type="number" min="0" label="Quantity"></v-text-field>
                          </td>
                          <td>{{ ingredient.unit }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>

              </v-container>

              <!-- container for blend -->

              <v-container v-if="productStore.isBlend">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Blend</v-subheader>
                    <v-text-field v-model="productStore.productTypes[2].productTypePrice" label="Type price" type="number" required />
                  </v-col>
                  <v-col cols="12">
                    
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
                            <v-checkbox v-model="productStore.selectedIngredientsBlend" :value="ingredient.IngredientId" @change="() => handleBlendIngredientSelect( ingredient)"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.IngredientId}/image`" height="100"></v-img>
                          </td>
                          <td>{{ ingredient.nameIngredient }}</td>
                          <td>
                            <v-text-field v-if="productStore.selectedIngredientsBlend.includes(ingredient.IngredientId)" v-model="productStore.ingredientQuantitiesBlend[ingredient.IngredientId]" type="number" min="0" label="Quantity"></v-text-field>
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
        <v-btn color="blue darken-1" @click="productStore.updateProductDialog = false">Close</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

