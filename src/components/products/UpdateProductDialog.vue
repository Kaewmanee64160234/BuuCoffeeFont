<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useProductStore } from '@/stores/product.store';
import type { Ingredient } from '@/types/ingredient.type';
import type { ProductType } from '@/types/productType.type';
import { ref, reactive, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';

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
const isHot = ref(false);
const isCold = ref(false);
const isBlend = ref(false);

watch(() => productStore.product.category?.categoryName, (newVal) => {
  const category = categoryStore.categories.find(c => c.categoryName === newVal);
  isDrink.value = category?.haveTopping === true;
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
});

const handleProductTypeChange = (type: string, isChecked: boolean) => {
  const typeIndex = productStore.productTypes.findIndex(pt => pt.productTypeName === type);
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
    if (type === 'Hot') {
      productStore.selectedIngredientsHot = [];
      productStore.ingredientQuantitiesHot = {};
    } else if (type === 'Cold') {
      productStore.selectedIngredientsCold = [];
      productStore.ingredientQuantitiesCold = {};
    } else if (type === 'Blend') {
      productStore.selectedIngredientsBlend = [];
      productStore.ingredientQuantitiesBlend = {};
    }
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

const handleHotIngredientSelect = (ingredient: Ingredient) => {
  const ingredientId = ingredient.ingredientId;
  const keys = Object.keys(productStore.ingredientQuantitiesHot);
  const index = keys.find(key => key === ingredientId.toString()) ? keys.indexOf(ingredientId.toString()) : -1;
  console.log('Index:', index);
  console.log('Keys:', keys);
  console.log('IngredientId:', productStore.ingredientQuantitiesHot[ingredientId]);
  if (index === -1) {
    productStore.selectedIngredientsHot.push(ingredientId);
    productStore.ingredientQuantitiesHot[ingredientId] = 0;
    productStore.selectedIngredientsHot.splice(ingredientId, 1);

  } else {
    productStore.selectedIngredientsHot.splice(index + 1, 1);
    delete productStore.ingredientQuantitiesHot[ingredientId];
  }
};


const handleColdIngredientSelect = (ingredient: Ingredient) => {
  const ingredientId = ingredient.ingredientId;
  const keys = Object.keys(productStore.ingredientQuantitiesCold);
  const index = keys.find(key => key === ingredientId.toString()) ? keys.indexOf(ingredientId.toString()) : -1;
  console.log('Index:', index);
  console.log('Keys:', keys);
  console.log('IngredientId:', productStore.ingredientQuantitiesCold[ingredientId]);
  if (index === -1) {
    productStore.selectedIngredientsCold.push(ingredientId);
    productStore.ingredientQuantitiesCold[ingredientId] = 0;
    productStore.selectedIngredientsCold.splice(ingredientId, 1);

  } else {
    productStore.selectedIngredientsCold.splice(index + 1, 1);
    delete productStore.ingredientQuantitiesCold[ingredientId];
  }
};

const handleBlendIngredientSelect = (ingredient: Ingredient) => {
  const ingredientId = ingredient.ingredientId;
  const keys = Object.keys(productStore.ingredientQuantitiesBlend);
  const index = keys.find(key => key === ingredientId.toString()) ? keys.indexOf(ingredientId.toString()) : -1;
  console.log('Index:', index);
  console.log('Keys:', keys);
  console.log('IngredientId:', productStore.ingredientQuantitiesBlend[ingredientId]);
  if (index === -1) {
    productStore.selectedIngredientsBlend.push(ingredientId);
    productStore.ingredientQuantitiesBlend[ingredientId] = 0;
    productStore.selectedIngredientsBlend.splice(ingredientId, 1);

  } else {
    productStore.selectedIngredientsBlend.splice(index + 1, 1);
    delete productStore.ingredientQuantitiesBlend[ingredientId];
  }
};


const loadProductData = () => {
  const product = productStore.product;

  productName.value = product.productName;
  productPrice.value = product.productPrice;
  selectedCategory.value = product.category.categoryName;
  imagePreview.value = product.productImage ? `${import.meta.env.VITE_URL_PORT}/products/${product.productId}/image` : null;
};

const checkCategory = () => {
  const category = categoryStore.categories.find(c => c.categoryName === selectedCategory.value);
  isDrink.value = category?.haveTopping === true;
  if (!isDrink.value) {
    isHot.value = false;
    isCold.value = false;
    isBlend.value = false;
    productDetails.value = [];
  }
};

const submitForm = async () => {
  if (!form.value.validate()) return;

  const productData = {
    productName: productStore.productName,
    productPrice: productStore.productPrice,
    productImage: productStore.product.productImage,
    categoryId: categoryStore.categoriesForCreate.find(category => category.categoryName === selectedCategory.value)?.categoryId || null,
    productTypes: [] as ProductType[]
  };

  if (isDrink.value) {
    if (productStore.selectedIngredientsHot.length > 0) {
      productData.productTypes.push({
        productTypeName: 'Hot',
        productTypePrice: 0,
        recipes: productStore.selectedIngredientsHot.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
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
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
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
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
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
    closeDialog();
    showSuccessDialog('Product created successfully!');
  } catch (error) {
    console.error('Error updating product:', error);
    Swal.fire('Error', 'An error occurred while creating the product.', 'error');
  }
};

// closeDialog
const closeDialog = () => {
  productStore.product = {
    category: { categoryId: 0, categoryName: '' },
    productName: '',
    productPrice: 0,
    productImage: '',
    productTypes: [],
    productId: 0,
    file: new File([""], "")
  };
  // clear all data in productStore
  productStore.productName = '';
  productStore.productPrice = 0;
  productStore.selectedCategory = '';
  productStore.imagePreview = null;
  productStore.isHot = false;
  productStore.isCold = false;
  productStore.isBlend = false;
  productStore.selectedIngredientsHot = [];
  productStore.ingredientQuantitiesHot = {};
  productStore.selectedIngredientsCold = [];
  productStore.ingredientQuantitiesCold = {};
  productStore.selectedIngredientsBlend = [];
  productStore.ingredientQuantitiesBlend = {};
  productStore.updateProductDialog = false;
};

const showSuccessDialog = (message: string) => {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

</script>



<template>
  <v-dialog v-model="productStore.updateProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">Update Product</span>
      </v-card-title>
      <v-card-text>
{{  productStore.selectedIngredientsBlend }}
{{ productStore.ingredientQuantitiesBlend }}

{{ productStore.selectedIngredientsCold }}

{{ productStore.ingredientQuantitiesCold }}

{{ productStore.selectedIngredientsHot }}

{{ productStore.ingredientQuantitiesHot }}
        <v-container>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-file-input v-model="productImage" label="Product image" prepend-icon="mdi-camera" accept="image/*"
                  @change="handleImageUpload" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-img :src="`${productStore.imagePreview}`" max-height="200" />
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
                <v-checkbox label="Hot" v-model="productStore.isHot"
                  @change="handleProductTypeChange('Hot', isHot)"></v-checkbox>
                <v-checkbox label="Cold" v-model="productStore.isCold"
                  @change="handleProductTypeChange('Cold', isCold)"></v-checkbox>
                <v-checkbox label="Blend" v-model="productStore.isBlend"
                  @change="handleProductTypeChange('Blend', isBlend)"></v-checkbox>
              </v-row>

              <v-container v-if="productStore.isHot">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Hot</v-subheader>
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
                        <tr v-for="ingredient in ingredientStore.ingredients" :key="ingredient.ingredientId">
                          <td>
                            <v-checkbox :value="ingredient.ingredientId" v-model="productStore.selectedIngredientsHot"
                              @change="handleHotIngredientSelect(ingredient)">
                            </v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.ingredientId}/image`"
                              height="100"></v-img>
                          </td>
                          <td>{{ ingredient.ingredientName }}</td>
                          <td>
                            <v-text-field v-if="productStore.selectedIngredientsHot.includes(ingredient.ingredientId)"
                              v-model="productStore.ingredientQuantitiesHot[ingredient.ingredientId]" type="number"
                              min="0" label="Quantity"></v-text-field>
                          </td>
                          <td>{{ ingredient.igredientUnit }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
              </v-container>

              <v-container v-if="productStore.isCold">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Cold</v-subheader>
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
                        <tr v-for="ingredient in ingredientStore.ingredients" :key="ingredient.ingredientId">
                          <td>
                            <v-checkbox :value="ingredient.ingredientId" v-model="productStore.selectedIngredientsCold"
                              @change="handleColdIngredientSelect(ingredient)">
                            </v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.ingredientId}/image`"
                              height="100"></v-img>
                          </td>
                          <td>{{ ingredient.ingredientName }}</td>
                          <td>
                            <v-text-field v-if="productStore.selectedIngredientsCold.includes(ingredient.ingredientId)"
                              v-model="productStore.ingredientQuantitiesCold[ingredient.ingredientId]" type="number"
                              min="0" label="Quantity"></v-text-field>
                          </td>
                          <td>{{ ingredient.igredientUnit }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
              </v-container>

              <v-container v-if="productStore.isBlend">
                <v-row>
                  <v-col cols="12">
                    <v-subheader>Blend</v-subheader>
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
                        <tr v-for="ingredient in ingredientStore.ingredients" :key="ingredient.ingredientId">
                          <td>
                            <v-checkbox :value="ingredient.ingredientId" v-model="productStore.selectedIngredientsBlend"
                              @change="handleBlendIngredientSelect(ingredient)">
                            </v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${ingredient.ingredientId}/image`"
                              height="100"></v-img>
                          </td>
                          <td>{{ ingredient.ingredientName }}</td>
                          <td>
                            <v-text-field v-if="productStore.selectedIngredientsBlend.includes(ingredient.ingredientId)"
                              v-model="productStore.ingredientQuantitiesBlend[ingredient.ingredientId]" type="number"
                              min="0" label="Quantity"></v-text-field>
                          </td>
                          <td>{{ ingredient.igredientUnit }}</td>
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
        <v-btn color="blue darken-1" @click="closeDialog()">Close</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
