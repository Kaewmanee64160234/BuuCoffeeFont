<template>
  <v-dialog v-model="productStore.createProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">สร้างสินค้า</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" sm="12">
              <v-img v-if="imagePreview" :src="imagePreview" max-height="100" style="border-radius: 50%;" />
            </v-col>
            <v-col cols="12" sm="12">
              <v-file-input v-model="productImage" label="รูปภาพสินค้า" prepend-icon="mdi-camera"
                accept="image/*" variant="solo" @change="handleImageUpload" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field variant="solo" v-model="productName" label="ชื่อสินค้า" :rules="nameRules"  
                :error-messages="!productName ? ['กรุณากรอกชื่อสินค้า'] : []" required />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select v-model="selectedCategory"
                :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                label="เลือกหมวดหมู่" dense variant="solo" @change="checkCategory"
                :error-messages="!selectedCategory ? ['กรุณาเลือก'] : []"  />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field variant="solo" v-model="barcode" label="บาร์โค้ด" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="storeName" :items="storeNames" label="เลือกชื่อร้าน" dense variant="solo"
                :error-messages="!storeName ? ['กรุณาเลือก'] : []" />
            </v-col>
            <v-col cols="12" sm="6" v-if="!isDrink">
              <v-text-field variant="solo" v-model="productPrice" label="ราคา" type="number" 
                :rules="priceRules" :error-messages="!productPrice ? ['กรุณากรอกราคาเริ่มต้น'] : []" required />
            </v-col>
            <!-- Product Type Checkboxes (Only show if haveTopping === true) -->
            <v-col cols="12" v-if="isDrink">
              <v-checkbox label="ร้อน" v-model="productTypes.hot" @change="handleProductTypeChange('ร้อน', productTypes.hot)" />
              <v-checkbox label="เย็น" v-model="productTypes.cold" @change="handleProductTypeChange('เย็น', productTypes.cold)" />
              <v-checkbox label="ปั่น" v-model="productTypes.blend" @change="handleProductTypeChange('ปั่น', productTypes.blend)" />
            </v-col>

            <!-- Show Price TextFields Based on Selected Product Types -->
            <v-col cols="12" v-if="productTypes.hot && isDrink ">
              <v-text-field variant="solo" v-model="productTypesPrice.hot" label="ราคาสินค้าร้อน" type="number" required />
            </v-col>
            <v-col cols="12" v-if="productTypes.cold  && isDrink ">
              <v-text-field variant="solo" v-model="productTypesPrice.cold" label="ราคาสินค้าเย็น" type="number" required />
            </v-col>
            <v-col cols="12" v-if="productTypes.blend  && isDrink ">
              <v-text-field variant="solo" v-model="productTypesPrice.blend" label="ราคาสินค้าปั่น" type="number" required />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="clearData">ปิด</v-btn>
        <v-btn color="primary" @click="submitForm" :disabled="!valid">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import Swal from 'sweetalert2';

const valid = ref(false);
const productName = ref('');
const productPrice = ref(0);
const barcode = ref(''); // Barcode ref
const productImage = ref(new File([], ''));
const imagePreview = ref<string | null>(null);
const selectedCategory = ref(null);
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const storeName = ref('');
const storeNames = ['ร้านข้าว', 'ร้านกาแฟ'];

// Define the reactive model for product types and prices
const productTypes = reactive({
  hot: false,
  cold: false,
  blend: false
});

const productTypesPrice = reactive({
  hot: 0,
  cold: 0,
  blend: 0
});

const isDrink = ref(false); // This will be used to show checkboxes based on `haveTopping`

const nameRules = [
  (v: string) => !!v || 'ชื่อสินค้าจำเป็นต้องระบุ',
  (value: string) => /^[\u0E00-\u0E7Fa-zA-Z0-9]+$/.test(value) || 'กรุณากรอกชื่อสินค้าเป็นตัวอักษรหรือตัวเลขเท่านั้น',
];

const priceRules = [
  (v: number) => !!v || 'ราคาสินค้าจำเป็นต้องระบุ',
  (v: number) => v > 0 || 'ราคาสินค้าต้องมากกว่า 0'
];

// Watch the selected category and determine if it has topping
watch(() => selectedCategory.value, (newCategory) => {
  checkCategory();
});

onMounted(async () => {
  await categoryStore.getAllCategories();
});

// Function to check if the category has topping
const checkCategory = () => {
  const category = categoryStore.categories.find(c => c.categoryName === selectedCategory.value);
  isDrink.value = category?.haveTopping === true; // If haveTopping is true, show the product type checkboxes
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    productImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const handleProductTypeChange = (type: string, isChecked: boolean) => {
  if (!isChecked) {
    if (type === 'ร้อน') productTypesPrice.hot = 0;
    if (type === 'เย็น') productTypesPrice.cold = 0;
    if (type === 'ปั่น') productTypesPrice.blend = 0;
  }
};

const submitForm = async () => {
  const productData = {
    productName: productName.value,
    productPrice: productPrice.value,
    barcode: barcode.value,
    productImage: productImage.value,
    categoryId: categoryStore.categories.find(c => c.categoryName === selectedCategory.value)?.categoryId,
    storeType: storeName.value,
    productTypes: []
  };

  // Add selected product types and their corresponding prices
  if (productTypes.hot) {
    productData.productTypes.push({ productTypeName: 'ร้อน', productTypePrice: productTypesPrice.hot });
  }
  if (productTypes.cold) {
    productData.productTypes.push({ productTypeName: 'เย็น', productTypePrice: productTypesPrice.cold });
  }
  if (productTypes.blend) {
    productData.productTypes.push({ productTypeName: 'ปั่น', productTypePrice: productTypesPrice.blend });
  }

  productStore.product = {
    ...productData,
    productId: 0,
    file: productImage.value
  };

  await productStore.createProduct();
  clearData();
  showSuccessDialog('สินค้านี้ถูกสร้างเรียบร้อยแล้ว!');
};

const clearData = () => {
  productName.value = '';
  productPrice.value = 0;
  barcode.value = '';
  productImage.value = new File([], '');
  imagePreview.value = null;
  selectedCategory.value = null;
  productTypes.hot = false;
  productTypes.cold = false;
  productTypes.blend = false;
  productTypesPrice.hot = 0;
  productTypesPrice.cold = 0;
  productTypesPrice.blend = 0;
  storeName.value = '';
  productStore.createProductDialog = false;
};

const showSuccessDialog = (message: string) => {
  Swal.fire({
    title: 'เสร็จสิ้น!',
    text: message,
    icon: 'success',
    confirmButtonText: 'ตกลง'
  });
};
</script>
