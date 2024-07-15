<template>
  <v-dialog v-model="productStore.updateProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">แก้ไขสินค้า</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="e1">
          <template v-slot:default="{ prev, next }">
            <v-stepper-header>
              <v-stepper-item :complete="e1 > 1" step="1" :value="1" editable>
                รายละเอียดสินค้า
              </v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item v-if="isDrink" :complete="e1 > 2" step="2" :value="2" editable>
                เลือกประเภทสินค้า
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
                    <v-col cols="12" sm="12">
                      <v-img max-height="100" style="border-radius: 50%;"
                        :src="imagePreview || `http://localhost:3000/products/${productStore.editedProduct.productId}/image`" />
                    </v-col>
                    <v-col cols="12" sm="12">
                      <v-file-input v-model="productImage" label="รูปภาพสินค้า" prepend-icon="mdi-camera"
                        accept="image/*" @change="handleImageUpload" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productStore.editedProduct.productName" label="ชื่อสินค้า"
                        required />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productStore.editedProduct.productPrice" label="ราคา"
                        type="number" required />
                    </v-col>
                  
                  
                    <v-col cols="12" sm="6">
                      <v-select v-model="productStore.selectedCategoryForUpdate"
                        :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                        label="เลือกหมวดหมู่" dense @change="checkCategory"></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field variant="solo" v-model="productStore.editedProduct.barcode" label="บาร์โค้ด" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-checkbox v-model="productStore.editedProduct.countingPoint" label="นับแต้ม" />
                    </v-col>
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <v-stepper-window-item v-if="isDrink" :value="2">
                <v-form ref="form" v-model="valid">
                  <v-row class="d-flex justify-space-between">
                    <v-checkbox label="ร้อน" v-model="productStore.isHot"
                      @change="handleProductTypeChange('ร้อน', productStore.isHot)"></v-checkbox>
                    <v-checkbox label="เย็น" v-model="productStore.isCold"
                      @change="handleProductTypeChange('เย็น', productStore.isCold)"></v-checkbox>
                    <v-checkbox label="ปั่น" v-model="productStore.isBlend"
                      @change="handleProductTypeChange('ปั่น', productStore.isBlend)"></v-checkbox>
                  </v-row>
                </v-form>
              </v-stepper-window-item>

              <v-stepper-window-item v-for="(step, index) in computedSteps" :key="`content-${index + 3}`"
                :value="step.value">
                <v-form ref="form" v-model="valid">
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-subheader>{{ step.label }}</v-subheader>
                        <v-text-field v-if="step.label == 'ร้อน'" variant="solo" v-model="productStore.productTypePriceHot"
                          label="ราคาประเภทสินค้า" type="number" required />
                        <v-text-field v-else-if="step.label == 'เย็น'" variant="solo" v-model="productStore.productTypePriceCold"
                          label="ราคาประเภทสินค้า" type="number" required />
                        <v-text-field v-else variant="solo" v-model="productStore.productTypePriceBlend" label="ราคาประเภทสินค้า"
                          type="number" required />
                      </v-col>
                      <v-col cols="12">
                        <!-- Search bar for filtering ingredients -->
                        <v-text-field variant="solo"  v-model="searchQuery" label="ค้นหาวัตถุดิบ" prepend-icon="mdi-magnify" />
                      </v-col>
                      <v-col cols="12">
                        <v-table>
                          <thead>
                            <tr>
                              <th>เลือก</th>
                              <th>รูปภาพ</th>
                              <th>ชื่อ</th>
                              <th>จำนวน</th>
                              <th>หน่วย</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="ingredient in filteredIngredients" :key="ingredient.ingredientId">
                              <td>
                                <v-checkbox v-if="step.label === 'ร้อน'" :value="ingredient.ingredientId"
                                  v-model="productStore.selectedIngredientsHot"
                                  @change="handleHotIngredientSelect(ingredient)">
                                </v-checkbox>
                                <v-checkbox v-if="step.label === 'เย็น'" :value="ingredient.ingredientId"
                                  v-model="productStore.selectedIngredientsCold"
                                  @change="handleColdIngredientSelect(ingredient)">
                                </v-checkbox>
                                <v-checkbox v-if="step.label === 'ปั่น'" :value="ingredient.ingredientId"
                                  v-model="productStore.selectedIngredientsBlend"
                                  @change="handleBlendIngredientSelect(ingredient)">
                                </v-checkbox>
                              </td>
                              <td>
                                <v-img :src="`${url}/ingredients/${ingredient.ingredientId}/image`"
                                  height="100"></v-img>
                              </td>
                              <td>{{ ingredient.ingredientName }}</td>
                              <td>
                                <v-text-field variant="solo"
                                  v-if="step.label === 'ร้อน' && productStore.selectedIngredientsHot.includes(ingredient.ingredientId)"
                                  v-model="productStore.ingredientQuantitiesHot[ingredient.ingredientId]" type="number"
                                  min="0" label="จำนวน"></v-text-field>
                                <v-text-field variant="solo"
                                  v-if="step.label === 'เย็น' && productStore.selectedIngredientsCold.includes(ingredient.ingredientId)"
                                  v-model="productStore.ingredientQuantitiesCold[ingredient.ingredientId]" type="number"
                                  min="0" label="จำนวน"></v-text-field>
                                <v-text-field variant="solo"
                                  v-if="step.label === 'ปั่น' && productStore.selectedIngredientsBlend.includes(ingredient.ingredientId)"
                                  v-model="productStore.ingredientQuantitiesBlend[ingredient.ingredientId]"
                                  type="number" min="0" label="จำนวน"></v-text-field>
                              </td>
                              <td>{{ ingredient.ingredientQuantityPerSubUnit }}</td>
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
        <v-btn color="blue darken-1" @click="closeDialog()">ปิด</v-btn>
        <v-btn color="blue darken-1" @click="submitForm" :disabled="!valid">บันทึก</v-btn>
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
const barcode = ref(''); // New ref for barcode
const productImage = ref(new File([], ''));
const imagePreview = ref<string | null>(null);

const url = import.meta.env.VITE_URL_PORT;
const productStore = useProductStore();
const isDrink = ref(false);
const productDetails = ref<CustomProductType[]>([]);
const categoryStore = useCategoryStore();
const ingredientStore = useIngredientStore();

const e1 = ref(1);
const searchQuery = ref('');

const filteredIngredients = computed(() => {
  if (!searchQuery.value) return ingredientStore.ingredients;
  return ingredientStore.ingredients.filter((ingredient) =>
    ingredient.ingredientName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

watch(() => productStore.editedProduct.category?.categoryName, (newVal) => {
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
      stepsArray.push({ label: 'ร้อน', value: stepValue });
    }
    if (productStore.isCold) {
      stepValue++;
      stepsArray.push({ label: 'เย็น', value: stepValue });
    }
    if (productStore.isBlend) {
      stepValue++;
      stepsArray.push({ label: 'ปั่น', value: stepValue });
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
  const product = productStore.editedProduct;

  productName.value = product.productName;
  productPrice.value = product.productPrice;
  barcode.value = product.barcode; // Load barcode value
  productStore.selectedCategoryForUpdate = product.category.categoryName;
  imagePreview.value = product.productImage ? `${import.meta.env.VITE_URL_PORT}/products/${product.productId}/image` : null;
};

const checkCategory = () => {
  const category = categoryStore.categories.find(c => c.categoryName === productStore.selectedCategoryForUpdate);
  isDrink.value = category?.haveTopping === true;
  if (!isDrink.value) {
    productStore.isHot = false;
    productStore.isCold = false;
    productStore.isBlend = false;
    productDetails.value = [];
  }
};

const submitForm = async () => {
  const productData = {
    productName: productStore.editedProduct.productName,
    productPrice: productStore.editedProduct.productPrice,
    barcode: productStore.editedProduct.barcode,
    productImage: productStore.editedProduct.productImage,
    countingPoint: productStore.editedProduct.countingPoint,
    categoryId: categoryStore.categoriesForCreate.find(category => category.categoryName === productStore.selectedCategoryForUpdate)?.categoryId || null,
    productTypes: [] as ProductType[],
    category: categoryStore.categoriesForCreate.find(category => category.categoryName === productStore.selectedCategoryForUpdate) || { categoryId: 0, categoryName: '' }
  };

  if (isDrink.value) {
    if (productStore.selectedIngredientsHot.length > 0 && productStore.isHot) {
      productData.productTypes.push({
        productTypeName: 'ร้อน',
        productTypePrice: productStore.productTypePriceHot || 0,
        recipes: productStore.selectedIngredientsHot.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
            quantity: productStore.ingredientQuantitiesHot[ingredientId]
          };
        })
      });
    }
    if (productStore.selectedIngredientsCold.length > 0 && productStore.isCold) {
      productData.productTypes.push({
        productTypeName: 'เย็น',
        productTypePrice: productStore.productTypePriceCold || 0,
        recipes: productStore.selectedIngredientsCold.map((ingredientId) => {
          return {
            ingredient: ingredientStore.ingredients.find(i => i.ingredientId === ingredientId)!,
            quantity: productStore.ingredientQuantitiesCold[ingredientId]
          };
        })
      });
    }
    if (productStore.selectedIngredientsBlend.length > 0 && productStore.isBlend) {
      productData.productTypes.push({
        productTypeName: 'ปั่น',
        productTypePrice: productStore.productTypePriceBlend || 0,
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
    productStore.editedProduct = {
      ...productStore.editedProduct,
      ...productData,
      file: productImage.value
    };

    // If there's an image file in productImage, upload the image
    if (productImage.value.name !== '') {
      const formData = new FormData();
      formData.append('file', productImage.value);
      await productStore.updateImageProduct(productStore.editedProduct.productId, formData);
      imagePreview.value = URL.createObjectURL(productImage.value);
    }

    await productStore.updateProduct(productStore.editedProduct.productId, productStore.editedProduct);

    closeDialog();
    showSuccessDialog('แก้ไขสินค้าเสร็จสิ้น!');
  } catch (error) {
    console.error('Error updating product:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะแก้ไขสินค้า');
  }
};

const closeDialog = () => {
  productStore.editedProduct = {
    category: { categoryId: 0, categoryName: '' },
    productName: '',
    productPrice: 0,
    barcode: '', // Clear barcode value
    productImage: '',
    productTypes: [],
    productId: 0,
    countingPoint: false,
    file: new File([""], "")
  };
  productStore.editedProductName = '';
  productStore.editedProductPrice = 0;
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
  searchQuery.value = ''; // Reset search query when closing the dialog
};

const showSuccessDialog = (message: string) => {
  Swal.fire({
    title: 'สำเร็จ!',
    text: message,
    icon: 'success',
    confirmButtonText: 'ตกลง'
  });
};

function next() {
  console.log("Current Step (before next):", e1.value);
  const maxStep = computedSteps.value.length + 2; // +2 because step 1 is Product Details and step 2 is Select Product Type
  if (e1.value < maxStep) {
    e1.value++;
    searchQuery.value = ''; // Reset search query when clicking next
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

const getProductType = (typeName: string): CustomProductType => {
  const pddt = productStore.productTypes.find(pt => pt.productTypeName === typeName) as CustomProductType;
  return pddt;
};
</script>
