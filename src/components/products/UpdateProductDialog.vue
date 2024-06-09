<template>
  <v-dialog v-model="productStore.updateProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">Update Product</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="e1">
          <template v-slot:default="{ prev, next }">
            <v-stepper-header>
              <v-stepper-item :complete="e1 > 1" step="1" :value="1" editable>
                Product Details
              </v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item v-if="isDrink" :complete="e1 > 2" step="2" :value="2" editable>
                Select Product Type
              </v-stepper-item>
              <v-divider v-if="isDrink"></v-divider>
              <template v-if="isDrink" v-for="(step, index) in computedSteps" :key="index">
                <v-stepper-item :complete="e1 > step.value" :step="step.label" :value="step.value" editable>
                  {{ step.label }}
                </v-stepper-item>
                <v-divider v-if="index < computedSteps.length - 1"></v-divider>
              </template>
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item :value="1">
                <v-form ref="form" v-model="valid">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-file-input v-model="productImage" label="Product image" prepend-icon="mdi-camera" accept="image/*"
                        @change="handleImageUpload" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-img :src="imagePreview || `http://localhost:3000/products/${productStore.product.productId}/image`" max-height="200" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productStore.productName" label="Product name" required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productStore.productPrice" label="Price" type="number" required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select v-model="productStore.selectedCategory"
                        :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                        label="Select Category" dense @change="checkCategory"></v-select>
                    </v-col>
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <v-stepper-window-item v-if="isDrink" :value="2">
                <v-form ref="form" v-model="valid">
                  <v-row class="d-flex justify-space-between">
                    <v-checkbox label="Hot" v-model="productStore.isHot"
                      @change="handleProductTypeChange('Hot', productStore.isHot)"></v-checkbox>
                    <v-checkbox label="Cold" v-model="productStore.isCold"
                      @change="handleProductTypeChange('Cold', productStore.isCold)"></v-checkbox>
                    <v-checkbox label="Blend" v-model="productStore.isBlend"
                      @change="handleProductTypeChange('Blend', productStore.isBlend)"></v-checkbox>
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <v-stepper-window-item v-for="(step, index) in computedSteps" :key="`content-${index+3}`" :value="step.value">
                <v-form ref="form" v-model="valid">
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-subheader>{{ step.label }}</v-subheader>
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
                                <v-checkbox v-if="step.label === 'Hot'" :value="ingredient.ingredientId" v-model="productStore.selectedIngredientsHot"
                                  @change="handleHotIngredientSelect(ingredient)">
                                </v-checkbox>
                                <v-checkbox v-if="step.label === 'Cold'" :value="ingredient.ingredientId" v-model="productStore.selectedIngredientsCold"
                                  @change="handleColdIngredientSelect(ingredient)">
                                </v-checkbox>
                                <v-checkbox v-if="step.label === 'Blend'" :value="ingredient.ingredientId" v-model="productStore.selectedIngredientsBlend"
                                  @change="handleBlendIngredientSelect(ingredient)">
                                </v-checkbox>
                              </td>
                              <td>
                                <v-img :src="`${url}/ingredients/${ingredient.ingredientId}/image`" height="100"></v-img>
                              </td>
                              <td>{{ ingredient.ingredientName }}</td>
                              <td>
                                <v-text-field variant="solo" v-if="step.label === 'Hot' && productStore.selectedIngredientsHot.includes(ingredient.ingredientId)"
                                  v-model="productStore.ingredientQuantitiesHot[ingredient.ingredientId]" type="number"
                                  min="0" label="Quantity"></v-text-field>
                                <v-text-field variant="solo" v-if="step.label === 'Cold' && productStore.selectedIngredientsCold.includes(ingredient.ingredientId)"
                                  v-model="productStore.ingredientQuantitiesCold[ingredient.ingredientId]" type="number"
                                  min="0" label="Quantity"></v-text-field>
                                <v-text-field variant="solo" v-if="step.label === 'Blend' && productStore.selectedIngredientsBlend.includes(ingredient.ingredientId)"
                                  v-model="productStore.ingredientQuantitiesBlend[ingredient.ingredientId]" type="number"
                                  min="0" label="Quantity"></v-text-field>
                              </td>
                              <td>{{ ingredient.ingredientUnit }}</td>
                            </tr>
                          </tbody>
                        </v-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-stepper-window-item>
            </v-stepper-window>

            <v-stepper-actions :disabled="disabled" @click:next="next" @click:prev="prev"></v-stepper-actions>
          </template>
        </v-stepper>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="closeDialog()">Close</v-btn>
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
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

const e1 = ref(1);

watch(() => productStore.product.category?.categoryName, (newVal) => {
  const category = categoryStore.categories.find(c => c.categoryName === newVal);
  isDrink.value = category?.haveTopping === true;
  if (!isDrink.value) {
    productStore.isHot = false;
    productStore.isCold = false;
    productStore.isBlend = false;
    productDetails.value = [];
  }
});
onMounted(async () => {
  await categoryStore.getAllCategories();
  await ingredientStore.getAllIngredients();

  // Auto add steps if ingredients are present
  if (productStore.selectedIngredientsHot.length > 0) {
    productStore.isHot = true;
  }
  if (productStore.selectedIngredientsCold.length > 0) {
    productStore.isCold = true;
  }
  if (productStore.selectedIngredientsBlend.length > 0) {
    productStore.isBlend = true;
  }
});

const computedSteps = computed(() => {
  const stepsArray = [];
  let stepValue = 2; // Start from 2 because step 1 is Product Details and step 2 is Select Product Type
  if (isDrink.value) {
    if (productStore.isHot) {
      stepValue++;

      stepsArray.push({ label: 'Hot', value: stepValue });
    }
    if (productStore.isCold) {
      stepValue++;

      stepsArray.push({ label: 'Cold', value: stepValue });
    }
    if (productStore.isBlend) {
      stepValue++;

      stepsArray.push({ label: 'Blend', value: stepValue });
    }
  }
  return stepsArray;
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
  if (index === -1) {
    productStore.selectedIngredientsHot.push(ingredientId);
    productStore.ingredientQuantitiesHot[ingredientId] = 0;
  } else {
    productStore.selectedIngredientsHot.splice(index, 1);
    delete productStore.ingredientQuantitiesHot[ingredientId];
  }
};

const handleColdIngredientSelect = (ingredient: Ingredient) => {
  const ingredientId = ingredient.ingredientId;
  const keys = Object.keys(productStore.ingredientQuantitiesCold);
  const index = keys.find(key => key === ingredientId.toString()) ? keys.indexOf(ingredientId.toString()) : -1;
  if (index === -1) {
    productStore.selectedIngredientsCold.push(ingredientId);
    productStore.ingredientQuantitiesCold[ingredientId] = 0;
  } else {
    productStore.selectedIngredientsCold.splice(index, 1);
    delete productStore.ingredientQuantitiesCold[ingredientId];
  }
};

const handleBlendIngredientSelect = (ingredient: Ingredient) => {
  const ingredientId = ingredient.ingredientId;
  const keys = Object.keys(productStore.ingredientQuantitiesBlend);
  const index = keys.find(key => key === ingredientId.toString()) ? keys.indexOf(ingredientId.toString()) : -1;
  if (index === -1) {
    productStore.selectedIngredientsBlend.push(ingredientId);
    productStore.ingredientQuantitiesBlend[ingredientId] = 0;
  } else {
    productStore.selectedIngredientsBlend.splice(index, 1);
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
    productStore.isHot = false;
    productStore.isCold = false;
    productStore.isBlend = false;
    productDetails.value = [];
  }
};

const submitForm = async () => {
  // if (!form.value.validate()) return;

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

    // if have image file in productImage upload image 

    console.log('Product:', JSON.stringify(productStore.product));

    await productStore.updateProduct(productStore.product.productId, productStore.product);
    if (productImage.value.name !== '') {
      const formData = new FormData();
      formData.append('file', productImage.value);
      await productStore.updateImageProduct(productStore.product.productId, formData);
      imagePreview.value = URL.createObjectURL(productImage.value);
    }

    closeDialog();
    showSuccessDialog('Product updated successfully!');
    // reload page
  } catch (error) {
    console.error('Error updating product:', error);
    Swal.fire('Error', 'An error occurred while updating the product.', 'error');
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

function next() {
  console.log("Current Step (before next):", e1.value);
  const maxStep = computedSteps.value.length + 2; // +2 because step 1 is Product Details and step 2 is Select Product Type
  if (e1.value < maxStep) {
    e1.value++;
  }
  console.log("Current Step (after next):", e1.value);
}

function prev() {
  console.log("Current Step (before prev):", e1.value);
  if (e1.value > 1) {
    e1.value--;
  }
  console.log("Current Step (after prev):", e1.value);
}


const disabled = computed(() => {
  return e1.value === 1 ? 'prev' : e1.value === computedSteps.value.length + 2 ? 'next' : undefined;
});

</script>

