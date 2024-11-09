

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import Swal from 'sweetalert2';

const form = ref(null);
const valid = ref(false);

const productImage = ref(new File([], ''));
const imagePreview = ref<string | null>(null);

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const isDrink = ref(false);
const storeNames = ['ร้านข้าว', 'ร้านกาแฟ'];
const e1 = ref(1);

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
  const productData = {
    productName: productStore.editedProduct.productName,
    productPrice: productStore.editedProduct.productPrice,
    barcode: productStore.editedProduct.barcode,
    productImage: productStore.editedProduct.productImage,
    storeType: productStore.storeName,
    countingPoint: productStore.countingPoint,
    haveTopping: productStore.editedProduct.haveTopping,

    categoryId: categoryStore.categoriesForCreate.find(category => category.categoryName === productStore.selectedCategoryForUpdate)?.categoryId || null,
    category:categoryStore.categoriesForCreate.find(category => category.categoryName === productStore.selectedCategoryForUpdate)!,
    productTypes: [],
  };

  if (productStore.isHot) {
    productData.productTypes.push({
      productTypeName: 'ร้อน',
      productTypePrice: productStore.productTypePriceHot || 0,
    });
  }
  if (productStore.isCold) {
    productData.productTypes.push({
      productTypeName: 'เย็น',
      productTypePrice: productStore.productTypePriceCold || 0,
    });
  }
  if (productStore.isBlend) {
    productData.productTypes.push({
      productTypeName: 'ปั่น',
      productTypePrice: productStore.productTypePriceBlend || 0,
    });
  }

  try {
    
    productStore.editedProduct = {
      ...productStore.editedProduct,
      ...productData,
      
    };
    if(productImage.value.size > 0){
      productStore.editedProduct.file = productImage.value;
    }
    console.log(productStore.editedProduct);
    

  
    await productStore.updateProduct(productStore.editedProduct.productId);

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
    file: new File([], "")
  };
  productStore.editedProductName = '';
  productStore.editedProductPrice = 0;
  productStore.selectedCategory = '';
  productStore.imagePreview = null;
  productStore.isHot = false;
  productStore.isCold = false;
  productStore.isBlend = false;
  productStore.updateProductDialog = false;
};

const showSuccessDialog = (message: string) => {
  Swal.fire({
    title: 'สำเร็จ!',
    text: message,
    icon: 'success',
    confirmButtonText: 'ตกลง'
  });
};

const disabled = computed(() => {
  return e1.value === 1 ? 'prev' : e1.value === 2 ? 'next' : undefined;
});
</script>

<template>
  <v-dialog v-model="productStore.updateProductDialog" persistent max-width="800px">
    <v-card>
      <v-card-title>
        <span class="headline">แก้ไขสินค้า</span>
      </v-card-title>
      <v-card-text>

        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" sm="12">
              <v-img max-height="100" style="border-radius: 50%;"
                :src="imagePreview || `http://localhost:3000/products/${productStore.editedProduct.productId}/image`" />
            </v-col>
            <v-col cols="12" sm="12">
              <v-file-input v-model="productImage" label="รูปภาพสินค้า" prepend-icon="mdi-camera" accept="image/*"
                @change="handleImageUpload" />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field variant="solo" v-model="productStore.editedProduct.productName" label="ชื่อสินค้า"
                required />
            </v-col>
            <v-col cols="12" sm="6"  v-if="!productStore.editedProduct.haveTopping" >
              <v-text-field variant="solo" v-model="productStore.editedProduct.productPrice" label="ราคา" type="number"
                required />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select variant="solo" v-model="productStore.selectedCategoryForUpdate"
                :items="categoryStore.categoriesForCreate.map(category => category.categoryName)" label="เลือกหมวดหมู่"
                dense @change="checkCategory"></v-select>
            </v-col>
            <v-col cols="12" sm="5">
              <v-text-field variant="solo" v-model="productStore.editedProduct.barcode" label="บาร์โค้ด" />
            </v-col>
            <v-col cols="12" sm="5">
              <v-select variant="solo" v-model="productStore.storeName" :items="storeNames" label="เลือกชื่อร้าน" dense />
            </v-col>
            <v-col cols="12" sm="2">
              <v-checkbox v-model="productStore.countingPoint" label="นับแต้ม" />
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="4" class="d-flex justify-center">
              <v-checkbox label="ร้อน" v-model="productStore.isHot"></v-checkbox>
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <v-checkbox label="เย็น" v-model="productStore.isCold"></v-checkbox>
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <v-checkbox label="ปั่น" v-model="productStore.isBlend"></v-checkbox>
            </v-col>
          </v-row>
          
          <!-- Price Fields for Each Product Type -->
          <v-row>
            <v-col cols="12" v-if="productStore.isHot">
              <v-text-field variant="solo" v-model="productStore.productTypePriceHot" label="ราคาประเภทสินค้าร้อน"
                type="number" required />
            </v-col>
            <v-col cols="12" v-if="productStore.isCold">
              <v-text-field variant="solo" v-model="productStore.productTypePriceCold" label="ราคาประเภทสินค้าเย็น"
                type="number" required />
            </v-col>
            <v-col cols="12" v-if="productStore.isBlend">
              <v-text-field variant="solo" v-model="productStore.productTypePriceBlend" label="ราคาประเภทสินค้าปั่น"
                type="number" required />
            </v-col>
          </v-row>
        </v-form>



      </v-card-text>
      <!-- v-card action -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">ยกเลิก</v-btn>
        <v-btn color="blue darken-1" text @click="submitForm">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
