<script setup lang="ts">
import { useCategoryStore } from '@/stores/category.store';
import { useProductStore } from '@/stores/product.store';


const productStore = useProductStore();
const categoryStore = useCategoryStore();
function handleFileChange(file: File) {
  productStore.product.file = file;
}
const url = 'http://localhost:3000';

  
</script>
<template>
  <div>
    <v-dialog v-model="productStore.createProductDialog" max-width="600px">
      <v-card>
        <v-stepper :items="['Step 1', 'Step 2', 'Step 3']">
          <template v-slot:item.1>
            <v-card title="เลือกประเภทสินค้า" flat>
              <v-container>
                <v-row>
                  <v-avatar size="36">
                    <!-- Image Display -->
                    <v-img v-if="productStore.product.productImage.length >0"    :src="productStore.product.productImage">
                   
                    </v-img>
                    <v-img v-else src="../../assets/images.png"></v-img>
                  </v-avatar>
                  <v-file-input v-model="productStore.product.file" label="Product Image" prepend-icon="mdi-camera"
                    accept="image/*" multiple @change="handleFileChange"></v-file-input>
                </v-row>
                <v-row>
                  <v-col> <v-text-field v-model="productStore.product.productName" label="Product Name"
                      required></v-text-field>
                  </v-col>
                  <v-col> <v-text-field v-model="productStore.product.productPrice" label="Price" prefix="$"
                      type="number" required></v-text-field></v-col>
                </v-row>
                <v-row>
                  <v-select v-model="productStore.selectedCategoryName"
                    :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                    label="Select Category" dense></v-select>
                </v-row>




              </v-container>

            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card title="Step Two" flat>...</v-card>
          </template>

          <template v-slot:item.3>
            <v-card title="Step Three" flat>...</v-card>
          </template>
        </v-stepper>
      </v-card>
    </v-dialog>

  </div>
</template>

<style></style>