<script lang="ts" setup>
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';
import { onMounted, ref } from 'vue';
import CreateProductDialog from '../../components/products/CreateProductDialog.vue';
import UpdateProductDialog from '../../components/products/UpdateProductDialog.vue';
import { useIngredientStore } from '@/stores/Ingredient.store';
import type { Product } from '@/types/product.type';
import Swal from 'sweetalert2';
import type { IngredientQuantities } from '@/types/productType.type';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const url = import.meta.env.VITE_URL_PORT;
const paginate = ref(true);
const ingredientStore = useIngredientStore();

onMounted(async () => {
  await categoryStore.getAllCategories();
  await ingredientStore.getAllIngredients();
  await productStore.getProductPaginate();
});

const openCreateDialog = () => {
  productStore.createProductDialog = true;
};

const openUpdateDialog = (product: Product) => {
  productStore.editedProduct = { ...product, file: new File([""], "") };
  loadProductData();
  productStore.updateProductDialog = true;
};

const loadProductData = () => {
  const product = productStore.editedProduct;

  productStore.productName = product.productName || '';
  productStore.productPrice = product.productPrice || 0;
  productStore.selectedCategoryForUpdate = product.category?.categoryName || null;
  productStore.imagePreview = product.productImage ? `${url}/products/${product.productId}/image` : null;
  productStore.barcode = product.barcode;
  productStore.storeName = product.storeType;
  productStore.countingPoint = product.countingPoint;

  if (product.productTypes!.length>0) {
    product.productTypes!.forEach(productType => {
      if (productType.productTypeName === 'ร้อน'  && productType.disable == false ) {
        productStore.productTypePriceHot = productType.productTypePrice;
        productStore.isHot = true;
        // productStore.selectedIngredientsHot = productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [];
        // productStore.ingredientQuantitiesHot = productType.recipes?.reduce((acc, recipeItem) => {
        //   acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
        //   return acc;
        // }, {} as IngredientQuantities) || {};
      }

      if (productType.productTypeName === 'เย็น' && productType.disable == false ) {
        productStore.productTypePriceCold = productType.productTypePrice;
        productStore.isCold = true;
        // productStore.selectedIngredientsCold = productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [];
        // productStore.ingredientQuantitiesCold = productType.recipes?.reduce((acc, recipeItem) => {
        //   acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
        //   return acc;
        // }, {} as IngredientQuantities) || {};
      }

      if (productType.productTypeName === 'ปั่น' && productType.disable == false ) {
        productStore.isBlend = true;
        productStore.productTypePriceBlend = productType.productTypePrice;
        // productStore.selectedIngredientsBlend = productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [];
        // productStore.ingredientQuantitiesBlend = productType.recipes?.reduce((acc, recipeItem) => {
        //   acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
        //   return acc;
        // }, {} as IngredientQuantities) || {};
      }

      productStore.productTypes.push({
        productTypeName: productType.productTypeName,
        productTypePrice: productType.productTypePrice,
        // selectedIngredients: productType.recipes?.map(recipeItem => recipeItem.ingredient.IngredientId) || [],
        // ingredientQuantities: productType.recipes?.reduce((acc, recipeItem) => {
        //   acc[recipeItem.ingredient.IngredientId] = recipeItem.quantity;
        //   return acc;
        // }, {} as IngredientQuantities) || {},
        // recipes: productType.recipes || []
      });
    });
  } else {
    productStore.productTypes = [];
  }
  console.log(productStore.isHot);
  console.log(productStore.isCold);
  console.log(productStore.isBlend);
  
};

const confirmDelete = async (deleteAction: () => Promise<void>) => {
  const result = await Swal.fire({
    title: 'คุณแน่ใจไหม?',
    text: "คุณจะไม่สามารถย้อนกลับมาแก้ไขได้อีกแล้วนะ!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  });

  if (result.isConfirmed) {
    await deleteAction();
    Swal.fire({
      title: 'ลบเสร็จสิ้น!',
      text: 'ลบสินค้าเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  }
};

const deleteProduct = async (productId: number) => {
  try {
    await confirmDelete(async () => {
      await productStore.deleteProduct(productId);
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะลบสินค้า');
  }
};
</script>

<template>
  <CreateProductDialog />
  <UpdateProductDialog />
  <v-container>
    <v-card>
      <v-card-title>
        <v-row style="padding: 20px;"><h3>สินค้า</h3></v-row>

        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field 
              v-model="productStore.searchQuery" 
              label="ค้นหาสินค้า" 
              append-inner-icon="mdi-magnify"
              hide-details 
              dense 
              variant="solo"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          
          <v-row align="center" justify="start">
            <v-col cols="auto">
              <v-btn @click="openCreateDialog" color="success">
                <v-icon left>mdi-plus</v-icon>
                เพิ่มสินค้า
              </v-btn>
            </v-col>
            <v-col class="mt-4 mr-2">
              <v-select 
                v-model="productStore.selectedCategory" 
                label="เลือกหมวดหมู่"
                :items="categoryStore.categories.map(category => category.categoryName)" 
                dense 
                hide-details
                variant="solo"
                class="mb-8"
              ></v-select>
            </v-col>
          </v-row>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <v-responsive>
          <v-table class="text-center " style="width: 97%;">
            <thead>
              <tr>
                <th style="text-align: center; font-weight: bold;">รหัสสินค้า</th>
                <th style="text-align: center; font-weight: bold;">รูปภาพ</th>
                <th style="text-align: center; font-weight: bold;">ชื่อสินค้า</th>
                <th style="text-align: center; font-weight: bold;">ประเภทสินค้า</th>
                <th style="text-align: center; font-weight: bold;">ราคา</th>
                <th style="text-align: center; font-weight: bold;">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in productStore.products" :key="index" style="text-align: center">
                <td>{{ index + 1 + (productStore.currentPage - 1) * productStore.itemsPerPage }}</td>
                <td>
                  <v-avatar size="80">
                    <v-img :src="`${url}/products/${item.productId}/image`"></v-img>
                  </v-avatar>
                </td>
                <td>{{ item.productName }}</td>
                <td>{{ item.category.categoryName }}</td>
                <td>{{ item.haveTopping ? item.productTypes![0].productTypePrice : item.productPrice }}</td>
                <td>
                  <v-btn color="#FFDD83" icon="mdi-pencil" class="mr-2" @click="openUpdateDialog(item)">
                  </v-btn>
                  <v-btn color="#F55050" icon="mdi-delete" @click="deleteProduct(item.productId)">
                  </v-btn>
                </td>
              </tr>
            </tbody>
            <tbody v-if="!productStore.products || productStore.products.length === 0">
              <tr>
                <td colspan="6" class="text-center">ไม่มีข้อมูล</td>
              </tr>
            </tbody>
          </v-table>
        </v-responsive>

        <v-pagination justify="center" v-model="productStore.currentPage" :length="Math.ceil(productStore.totalProducts / productStore.itemsPerPage)" 
        rounded="circle"></v-pagination>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
}

@media (max-width: 768px) {
  .fit-content {
    width: 100%;
    overflow-x: auto;
  }

  v-table {
    font-size: 0.8rem;
  }

  v-btn {
    min-width: 32px;
    height: 32px;
  }

  h3 {
    font-size: 1.2rem;
  }
}
</style>
