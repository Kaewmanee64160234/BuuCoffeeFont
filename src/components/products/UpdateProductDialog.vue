
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
      selectedIngredients: productType.recipe.map((recipeItem) => recipeItem.ingredient.IngredientId),
      ingredientQuantities: productType.recipe.reduce((acc, recipeItem) => {
        acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
        return acc;
      }, {} as IngredientQuantities),
      recipe: productType.recipe
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
};

const handleHotIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = productStore.selectedIngredientsHot.findIndex(id => id === ingredient.IngredientId);
  if (index === -1) {
    productStore.selectedIngredientsHot.push(ingredient.IngredientId);
    ingredientQuantitiesHot.value[ingredient.IngredientId] = 0;
  } else {
    productStore.selectedIngredientsHot.splice(index, 1);
    delete ingredientQuantitiesHot.value[ingredient.IngredientId];
  }
};

const handleColdIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = productStore.selectedIngredientsCold.findIndex(id => id === ingredient.IngredientId);
  if (index === -1) {
    productStore.selectedIngredientsCold.push(ingredient.IngredientId);
    ingredientQuantitiesCold.value[ingredient.IngredientId] = 0;
  } else {
    productStore.selectedIngredientsCold.splice(index, 1);
    delete ingredientQuantitiesCold.value[ingredient.IngredientId];
  }
};

const handleBlendIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = productStore.selectedIngredientsBlend.findIndex(id => id === ingredient.IngredientId);
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

const addRecipe = (type: CustomProductType) => {
  type.recipe.push({ ingredient: {} as Ingredient, quantity: 0 });
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
        recipe: productStore.selectedIngredientsHot.map((ingredientId) => {
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
        recipe: productStore.selectedIngredientsCold.map((ingredientId) => {
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
        recipe: productStore.selectedIngredientsBlend.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.IngredientId === ingredientId)!,
            quantity: productStore.ingredientQuantitiesBlend[ingredientId]
          };
        })
      });
    }
  }

  try {
    productStore.product = {
      category: categoryStore.categories.find(c => c.categoryName === productStore.product.category.categoryName)!,
      productName: productData.productName,
      productPrice: productData.productPrice,
      productImage: '',
      productTypes: productData.productTypes.map((productType) => {
        return {
          productTypeName: productType.productTypeName,
          productTypePrice: productType.productTypePrice,
          recipe: productType.recipe.map((recipeItem) => {
            return {
              ingredient: recipeItem.ingredient,
              quantity: recipeItem.quantity
            };
          })
        };
      }),
      productId: productStore.product.productId,
      file: productImage.value
    };
    console.log('Product:', JSON.parse(JSON.stringify(productStore.product)));
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

              <!-- <v-container v-for="(type, index) in productStore.productTypes" :key="index">
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
                            <v-checkbox v-if="type.productTypeName === 'Hot'" v-model="type.selectedIngredients" :value="ingredient.IngredientId" @change="() => handleHotIngredientSelect(type, ingredient)"></v-checkbox>
                            <v-checkbox v-if="type.productTypeName === 'Cold'" v-model="type.selectedIngredients" :value="ingredient.IngredientId" @change="() => handleColdIngredientSelect(type, ingredient)"></v-checkbox>
                            <v-checkbox v-if="type.productTypeName === 'Blend'" v-model="type.selectedIngredients" :value="ingredient.IngredientId" @change="() => handleBlendIngredientSelect(type, ingredient)"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.IngredientId}/image`" height="100"></v-img>
                          </td>
                          <td>{{ ingredient.nameIngredient }}</td>
                          <td>
                            <v-text-field v-if="type.productTypeName === 'Hot' && selectedIngredientsHot.includes(ingredient.IngredientId)" v-model="ingredientQuantitiesHot[ingredient.IngredientId]" type="number" min="0" label="Quantity"></v-text-field>
                            <v-text-field v-if="type.productTypeName === 'Cold' && selectedIngredientsCold.includes(ingredient.IngredientId)" v-model="ingredientQuantitiesCold[ingredient.IngredientId]" type="number" min="0" label="Quantity"></v-text-field>
                            <v-text-field v-if="type.productTypeName === 'Blend' && selectedIngredientsBlend.includes(ingredient.IngredientId)" v-model="ingredientQuantitiesBlend[ingredient.IngredientId]" type="number" min="0" label="Quantity"></v-text-field>
                          </td>
                          <td>{{ ingredient.unit }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
              </v-container> -->
              <!-- container for hot -->
              <v-container v-if="productStore.isHot">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Hot</v-subheader>
                    <v-text-field v-model="productStore.productTypes[0].productTypePrice" label="Type price" type="number" required />
                  </v-col>
                  <v-col cols="12">
                    <v-btn icon @click="() => addRecipe(productStore.productTypes[0])">
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
                            <v-checkbox v-model="productStore.selectedIngredientsHot" :value="ingredient.IngredientId" @change="() => handleHotIngredientSelect(productStore.productTypes[0], ingredient)"></v-checkbox>
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
                    <v-btn icon @click="() => addRecipe(productStore.productTypes[1])">
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
                            <v-checkbox v-model="productStore.selectedIngredientsCold" :value="ingredient.IngredientId" @change="() => handleColdIngredientSelect(productStore.productTypes[1], ingredient)"></v-checkbox>
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
                    <v-btn icon @click="() => addRecipe(productStore.productTypes[2])">
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
                            <v-checkbox v-model="productStore.selectedIngredientsBlend" :value="ingredient.IngredientId" @change="() => handleBlendIngredientSelect(productStore.productTypes[2], ingredient)"></v-checkbox>
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

