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
              <v-file-input v-model="productImage" label="รูปภาพสินค้า" prepend-icon="mdi-camera" accept="image/*"
                variant="solo" @change="handleImageUpload" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field variant="solo" v-model="productName" label="ชื่อสินค้า" :rules="nameRules"
                :error-messages="submitAttempted && !productName ? ['กรุณากรอกชื่อสินค้า'] : []" required />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select v-model="selectedCategory"
                :items="categoryStore.categoriesForCreate.map(category => category.categoryName)" label="เลือกหมวดหมู่"
                dense variant="solo" :error-messages="submitAttempted && !selectedCategory ? ['กรุณาเลือก'] : []" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field variant="solo" v-model="barcode" label="บาร์โค้ด" />
            </v-col>

            <v-col cols="12">
              <v-checkbox label="เครื่องดื่มที่สามารถชงได้" v-model="haveTopping" />
            </v-col>

            <v-col cols="12">
              <v-checkbox label="นับแต้ม" v-model="countingPoint" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select v-model="storeName" :items="storeNames" label="เลือกชื่อร้าน" dense variant="solo"
                :error-messages="submitAttempted && !storeName ? ['กรุณาเลือก'] : []" />
            </v-col>

            <v-col cols="12" sm="6" v-if="!haveTopping">
              <v-text-field variant="solo" v-model="productPrice" label="ราคา" type="number" :rules="priceRules"
                :error-messages="submitAttempted && !productPrice ? ['กรุณากรอกราคาเริ่มต้น'] : []" required />
            </v-col>

            <v-col cols="12" v-if="haveTopping">
              <v-checkbox label="ร้อน" v-model="productTypes.hot" @change="handleProductTypeChange('ร้อน', productTypes.hot)" />
              <v-checkbox label="เย็น" v-model="productTypes.cold" @change="handleProductTypeChange('เย็น', productTypes.cold)" />
              <v-checkbox label="ปั่น" v-model="productTypes.blend" @change="handleProductTypeChange('ปั่น', productTypes.blend)" />
            </v-col>

            <v-col cols="12" v-if="productTypes.hot && haveTopping">
              <v-text-field variant="solo" v-model="productTypesPrice.hot" label="ราคาสินค้าร้อน" type="number" required />
            </v-col>
            <v-col cols="12" v-if="productTypes.cold && haveTopping">
              <v-text-field variant="solo" v-model="productTypesPrice.cold" label="ราคาสินค้าเย็น" type="number" required />
            </v-col>
            <v-col cols="12" v-if="productTypes.blend && haveTopping">
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
import { ref, reactive, onMounted } from 'vue';
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import Swal from 'sweetalert2';
import type { Product } from '@/types/product.type';

const valid = ref(false);
const haveTopping = ref(false);
const productName = ref('');
const productPrice = ref(0);
const barcode = ref('');
const productImage = ref(new File([], ''));
const imagePreview = ref<string | null>(null);
const selectedCategory = ref(null);
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const storeName = ref('');
const storeNames = ['ร้านข้าว', 'ร้านกาแฟ'];
const countingPoint = ref(false);
const submitAttempted = ref(false);

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

const nameRules = [
  (v: string) => !!v || 'ชื่อสินค้าจำเป็นต้องระบุ',
  (value: string) => /^[\u0E00-\u0E7Fa-zA-Z0-9]+$/.test(value) || 'กรุณากรอกชื่อสินค้าเป็นตัวอักษรหรือตัวเลขเท่านั้น',
];

const priceRules = [
  (v: number) => !!v || 'ราคาสินค้าจำเป็นต้องระบุ',
  (v: number) => v > 0 || 'ราคาสินค้าต้องมากกว่า 0'
];

onMounted(async () => {
  await categoryStore.getAllCategories();
});

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    productImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const submitForm = async () => {
  submitAttempted.value = true;

  const category = categoryStore.categories.find(c => c.categoryName === selectedCategory.value);
  const productData: Product = {
    productName: productName.value,
    productPrice: haveTopping.value ? 0 : productPrice.value,
    barcode: barcode.value,
    productImage: productImage.value,
    categoryId: category ? category.categoryId : null,
    storeType: storeName.value,
    category: category!,
    haveTopping: haveTopping.value,
    productTypes: [],
    file: productImage.value,
    countingPoint: countingPoint.value
  };

  if (!category || !storeName.value || (haveTopping.value && !productData.productTypes.length)) {
    showErrorDialog('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  await productStore.createProduct(productData);
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
  haveTopping.value = false;
  countingPoint.value = false;
  submitAttempted.value = false;
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

const showErrorDialog = (message: string) => {
  Swal.fire({
    title: 'ข้อผิดพลาด!',
    text: message,
    icon: 'error',
    confirmButtonText: 'ตกลง'
  });
};
</script>
