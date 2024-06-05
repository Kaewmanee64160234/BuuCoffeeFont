<script setup lang="ts">
import { useCategoryStore } from '@/stores/category.store';
import { useIngredientStore } from '@/stores/Ingredient.store';
import { useProductStore } from '@/stores/product.store';
import { ref, watch } from 'vue';


const productStore = useProductStore();
const categoryStore = useCategoryStore();
const isDrink = ref(false);
const ingredientStore = useIngredientStore();
const selectedIngredients = ref<number[]>([]);
const url = 'http://localhost:3000';
const productTypes = ref({
  hot: false,
  cold: false,
  blend: false
});
const handleFileChange = (file: File) => {
  productStore.product.file = file;

}

const checkCategory = () => {
  isDrink.value = productStore.product.category.categoryName === "เครื่องดื่ม";
};

const handleProductTypeChange = (type: string, isChecked: boolean) => {
  const typeIndex = productStore.product.productTypes!.findIndex(pt => pt.productTypeName === type);
  if (isChecked && typeIndex === -1) {
    productStore.product.productTypes!.push({ productTypeName: type });
  } else if (!isChecked && typeIndex !== -1) {
    productStore.product.productTypes!.splice(typeIndex, 1);
  }
};

// Watch for category changes to automatically update checkbox visibility
watch(() => productStore.product.category.categoryName, (newVal) => {
  isDrink.value = newVal === "เครื่องดื่ม";
  // Reset checkboxes when category changes
  if (!isDrink.value) {
    productTypes.value = { hot: false, cold: false, blend: false };
  }
});


// Function to handle checkbox change
function toggleIngredientSelection(ingredientId: number) {
  const index = selectedIngredients.value.indexOf(ingredientId);
  if (index > -1) {
    selectedIngredients.value.splice(index, 1); // Remove the ingredient if it's already selected
  } else {
    selectedIngredients.value.push(ingredientId); // Add the ingredient if it's not already selected
  }
}

</script>
<template>
  <div>
    <v-dialog v-model="productStore.createProductDialog" max-width="80vh">
      <v-card>
        <v-stepper :items="['Step 1', 'Step 2', 'Step 3']">
          <template v-slot:item.1>
            <v-card title="เลือกประเภทสินค้า" flat>
              <v-container>
                <v-row>
                  <v-file-input v-model="productStore.product.file" label="Product Image" prepend-icon="mdi-camera"
                    accept="image/*" @change="handleFileChange"></v-file-input>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field v-model="productStore.product.productName" label="Product Name"
                      required></v-text-field>
                  </v-col>
                  <v-col>
                    <v-text-field v-model="productStore.product.productPrice" label="Price" prefix="$" type="number"
                      required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select v-model="productStore.product.category.categoryName"
                      :items="categoryStore.categoriesForCreate.map(category => category.categoryName)"
                      label="Select Category" dense @change="checkCategory"></v-select>
                  </v-col>
                  <v-col>
                    <!-- Checkboxes in the same row -->
                    <v-row v-if="isDrink" class="d-flex justify-space-between">
                      <v-checkbox label="Hot" v-model="productTypes.hot"
                        @change="handleProductTypeChange('hot', productTypes.hot)"></v-checkbox>
                      <v-checkbox label="Cold" v-model="productTypes.cold"
                        @change="handleProductTypeChange('cold', productTypes.cold)"></v-checkbox>
                      <v-checkbox label="Blend" v-model="productTypes.blend"
                        @change="handleProductTypeChange('blend', productTypes.blend)"></v-checkbox>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </template>

          <template v-slot:item.2>
            <div>Selected Ingredients: {{ selectedIngredients }}</div>
            <v-card title="Select Ingredients" class="stepper-content" flat>
              <v-container>
                <v-row>
                  <v-col>
                    <v-table class="text-center mt-5">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Select</th>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Quantity in Stock</th>
                          <th>Supplier</th>
                          <th>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in ingredientStore.ingredients" :key="item.IngredientId">
                          <td>{{ index + 1 }}</td>
                          <td>
                            <v-checkbox v-model="selectedIngredients" :value="item.IngredientId"></v-checkbox>
                          </td>
                          <td>
                            <v-img :src="`http://localhost:3000/ingredients/${item.IngredientId}/image`"
                              height="100"></v-img>
                          </td>
                          <td>{{ item.nameIngredient }}</td>
                          <td :style="{ color: item.quantityInStock < item.minimun ? 'red' : 'black' }">
                            {{ item.quantityInStock }}
                          </td>
                          <td>{{ item.supplier }}</td>
                          <td>{{ item.unit }}</td>
                        </tr>
                      </tbody>
                      <tbody v-if="!ingredientStore.ingredients.length">
                        <tr>
                          <td colspan="7" class="text-center">No data</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </template>


          <template v-slot:item.3>
            <v-card title="Step Three" flat>...</v-card>
          </template>

        </v-stepper>
      </v-card>

    </v-dialog>

  </div>
</template>

<style scoped>
.stepper-content {
  max-height: 70vh;
  /* Adjust based on your needs */
  overflow-y: auto;
}
</style>