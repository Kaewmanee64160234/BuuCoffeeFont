<script setup lang="ts">

import { onMounted, reactive, ref } from 'vue';
import { useProductStore } from '../../stores/product.store';
import type { Product } from '@/types/product.type';

const productStore = useProductStore()
const dialog = ref(false);
const search = ref('');
const dialogProduct = reactive({ id: 0, name: '', type: '', price: 0 });
onMounted(() => {
    console.log('Component is mounted')
    productStore.getAllProducts();
})


onMounted(() => {
    console.log('Component is mounted and ready');
});
</script>
<template>
    <v-container>
        <!-- Toolbar -->
        <v-toolbar color="cyan" dark>
            <v-toolbar-title>Product Management</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
        </v-toolbar>

        <!-- Add Button and Dialog -->
        <v-row>
            <v-col class="d-flex justify-end">
                <v-btn color="green" dark>
                    Add Product
                </v-btn>
            </v-col>
        </v-row>

        <!-- Product Table -->
        <table class="v-table v-data-table__wrapper">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in productStore.products" :key="item.productId">
                    <td>{{ item.productId }}</td>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.productType }}</td>
                    <td>{{ item.productPrice }}</td>
                    <td>
                        <v-icon small class="mr-2">
                            mdi-pencil
                        </v-icon>
                        <v-icon small>
                            mdi-delete
                        </v-icon>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Product Dialog -->
        <v-dialog max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ dialogProduct.id ? 'Edit' : 'Add' }} Product</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="dialogProduct.name" label="Product Name" required></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="dialogProduct.type" label="Product Type" required></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field type="number" v-model="dialogProduct.price" label="Price"
                                    required></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1">Cancel</v-btn>
                    <v-btn color="blue darken-1">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<style></style>