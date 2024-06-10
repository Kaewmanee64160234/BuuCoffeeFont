<template>
    <v-card>
      <v-img :src="product.image" height="200px"></v-img>
      <v-card-title>{{ product.name }}</v-card-title>
      <v-card-subtitle>{{ product.price }}</v-card-subtitle>
      <v-card-actions>
        <v-btn color="orange" @click="addToCart(product)">Add to Cart</v-btn>
      </v-card-actions>
    </v-card>
  </template>
  
  <script lang="ts" setup>
  import { defineProps, defineEmits } from 'vue';
  
  interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    category: string;
  }
  
  const props = defineProps<{ product: Product }>();
  const emit = defineEmits(['add-to-cart']);
  
  function addToCart(product: Product) {
    emit('add-to-cart', product);
  }
  </script>
  