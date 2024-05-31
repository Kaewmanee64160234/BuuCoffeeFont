<script lang="ts" setup>
import { useIngredientStore } from '@/stores/Ingredient.store';
import { computed, onMounted, ref, watch } from 'vue';

const ingredientStore = useIngredientStore();
const url = import.meta.env.VITE_URL_PORT;

onMounted(async () => {
    await ingredientStore.getAllIngredients();
});
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="9">
            Ingredients
          </v-col>
          <v-col cols="3">
            <!-- <v-text-field
              v-model="ingredientStore.searchQuery"
              label="Search"
              append-inner-icon="mdi-magnify"
              hide-details
              dense
            ></v-text-field> -->
          </v-col>
          <v-col>
            <v-btn color="success">
              <v-icon left>mdi-plus</v-icon>
              Add New Ingredient
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-table class="text-center mt-5">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Quantity in Stock</th>
            <th>Quantity per Unit</th>
            <th>Supplier</th>
            <th>Minimum</th>
            <th>Unit</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          <tr style="text-align: center" v-for="(item, index) in ingredientStore.ingredients" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.nameIngredient }}</td>
            <td>{{ item.quantityInStock }}</td>
            <td>{{ item.quantityPerUnit }}</td>
            <td>{{ item.supplier }}</td>
            <td>{{ item.minimun}}</td>
            <td>{{ item.unit }}</td>
            <td>
              <v-btn color="#FFDD83" class="mr-5" icon="mdi-pencil"></v-btn>
              <v-btn color="#F55050" class="mr-5" icon="mdi-delete"></v-btn>
            </td>
          </tr>
        </tbody>
        <tbody v-if="!ingredientStore.ingredients.length">
          <tr>
            <td colspan="8" class="text-center">No data</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
