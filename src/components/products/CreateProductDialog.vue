<template>
  <v-dialog v-model="productStore.createProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">Create Product</span>
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
              <template v-for="(step, index) in computedSteps" :key="index">
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
                      <v-file-input v-model="productImage" label="Product image" prepend-icon="mdi-camera" accept="image/*" @change="handleImageUpload" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-img v-if="imagePreview" :src="imagePreview" max-height="200"></v-img>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productName" label="Product name" required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productPrice" label="Price" type="number" required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select v-model="productStore.product.category.categoryName" :items="categoryStore.categoriesForCreate.map(category => category.categoryName)" label="Select Category" dense @change="checkCategory" />
                    </v-col>
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <v-stepper-window-item v-if="isDrink" :value="2">
                <v-form ref="form" v-model="valid">
                  <v-row class="d-flex justify-space-between">
                    <v-checkbox label="Hot" v-model="productTypes.hot" @change="() => handleProductTypeChange('Hot', productTypes.hot)" />
                    <v-checkbox label="Cold" v-model="productTypes.cold" @change="() => handleProductTypeChange('Cold', productTypes.cold)" />
                    <v-checkbox label="Blend" v-model="productTypes.blend" @change="() => handleProductTypeChange('Blend', productTypes.blend)" />
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <v-stepper-window-item v-for="(step, index) in computedSteps" :key="`content-${index+3}`" :value="step.value">
                <v-form ref="form" v-model="valid">
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-subheader>{{ step.label }}</v-subheader>
                        <v-text-field variant="solo" v-model="getProductType(step.label).productTypePrice" label="Type price" type="number" required />
                      </v-col>
                      <v-col cols="12">
                        <v-btn icon @click="() => addRecipe(getProductType(step.label))">
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
                            <tr v-for="ingredient in ingredientStore.ingredients" :key="ingredient.ingredientId">
                              <td>
                                <v-checkbox v-if="step.label === 'Hot'" v-model="getProductType(step.label).selectedIngredients" :value="ingredient.ingredientId" @change="() => handleHotIngredientSelect(getProductType(step.label), ingredient)" />
                                <v-checkbox v-if="step.label === 'Cold'" v-model="getProductType(step.label).selectedIngredients" :value="ingredient.ingredientId" @change="() => handleColdIngredientSelect(getProductType(step.label), ingredient)" />
                                <v-checkbox v-if="step.label === 'Blend'" v-model="getProductType(step.label).selectedIngredients" :value="ingredient.ingredientId" @change="() => handleBlendIngredientSelect(getProductType(step.label), ingredient)" />
                              </td>
                              <td>
                                <v-img :src="`http://localhost:3000/ingredients/${ingredient.ingredientId}/image`" height="100" />
                              </td>
                              <td>{{ ingredient.ingredientName }}</td>
                              <td>
                                <v-text-field variant="solo" v-if="step.label === 'Hot' && selectedIngredientsHot.includes(ingredient.ingredientId)" v-model="ingredientQuantitiesHot[ingredient.ingredientId]" type="number" min="0" label="Quantity" />
                                <v-text-field variant="solo" v-if="step.label === 'Cold' && selectedIngredientsCold.includes(ingredient.ingredientId)" v-model="ingredientQuantitiesCold[ingredient.ingredientId]" type="number" min="0" label="Quantity" />
                                <v-text-field variant="solo" v-if="step.label === 'Blend' && selectedIngredientsBlend.includes(ingredient.ingredientId)" v-model="ingredientQuantitiesBlend[ingredient.ingredientId]" type="number" min="0" label="Quantity" />
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
        <v-btn color="primary" @click="clearData">Close</v-btn>
        <v-btn color="primary" @click="submitForm" :disabled="!valid">Save</v-btn>
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

const dialog = ref(false);
const step = ref(1);
const steps = ref(5);
const e1 = ref(1);
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

const computedSteps = computed(() => {
  const stepsArray = [];
  if (isDrink.value) {
    if (productTypes.hot) stepsArray.push({ label: 'Hot', value: 3 });
    if (productTypes.cold) stepsArray.push({ label: 'Cold', value: 4 });
    if (productTypes.blend) stepsArray.push({ label: 'Blend', value: 5 });
  }
  return stepsArray;
});

watch(() => productStore.product.category.categoryName, (newVal) => {
  const category = categoryStore.categories.find(c => c.categoryName === newVal);
  isDrink.value = category?.haveTopping === true;
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
};

const handleHotIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = selectedIngredientsHot.value.findIndex(id => id === ingredient.ingredientId);
  if (index === -1) {
    selectedIngredientsHot.value.push(ingredient.ingredientId);
    ingredientQuantitiesHot.value[ingredient.ingredientId] = 0;
  } else {
    selectedIngredientsHot.value.splice(index, 1);
    delete ingredientQuantitiesHot.value[ingredient.ingredientId];
  }
};

const handleColdIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = selectedIngredientsCold.value.findIndex(id => id === ingredient.ingredientId);
  if (index === -1) {
    selectedIngredientsCold.value.push(ingredient.ingredientId);
    ingredientQuantitiesCold.value[ingredient.ingredientId] = 0;
  } else {
    selectedIngredientsCold.value.splice(index, 1);
    delete ingredientQuantitiesCold.value[ingredient.ingredientId];
  }
};

const handleBlendIngredientSelect = (type: CustomProductType, ingredient: Ingredient) => {
  const index = selectedIngredientsBlend.value.findIndex(id => id === ingredient.ingredientId);
  if (index === -1) {
    selectedIngredientsBlend.value.push(ingredient.ingredientId);
    ingredientQuantitiesBlend.value[ingredient.ingredientId] = 0;
  } else {
    selectedIngredientsBlend.value.splice(index, 1);
    delete ingredientQuantitiesBlend.value[ingredient.ingredientId];
  }
};
const getProductType = (typeName: string): CustomProductType => {
  return productDetails.value.find(pt => pt.productTypeName === typeName) as CustomProductType;
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
  if (!productStore.product.category.categoryName) {
    alert('Please select a valid category.');
    return;
  }

  if (!productName.value) {
    alert('Please enter a product name.');
    return;
  }

  if (productPrice.value <= 0) {
    alert('Please enter a valid product price.');
    return;
  }

  if (!productStore.product.category.categoryName) {
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
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
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
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
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
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
            quantity: ingredientQuantitiesBlend.value[ingredientId]
          };
        })
      });
    }
  }

  productStore.product = {
    category: categoryStore.categories.find(c => c.categoryName === productStore.product.category.categoryName)!,
    productName: productData.productName,
    productPrice: productData.productPrice,
    productImage: '',
    productTypes: productData.productTypes,
    productId: 0,
    file: productImage.value
  };
  await productStore.createProduct();
  clearData();
  showSuccessDialog('Product created successfully!');
};

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

const showSuccessDialog = (message: string) => {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

function next() {
  if (e1.value < steps.value) {
    e1.value++;
  }
}

function prev() {
  if (e1.value > 1) {
    e1.value--;
  }
}
const disabled = computed(() => {
  return e1.value === 1 ? 'prev' : e1.value === steps.value ? 'next' : undefined;
});
</script>
