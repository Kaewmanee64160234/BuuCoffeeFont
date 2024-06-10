<template>
    <v-tabs v-model="selectedCategory">
      <v-tab v-for="category in categories" :key="category">
        {{ category }}
      </v-tab>
    </v-tabs>
  </template>
  
  <script lang="ts" setup>
  import { ref, watch } from 'vue';
  
  const selectedCategory = ref<string | null>(null);
  const categories = ref(['Coffee', 'Tea', 'Soda', 'Snacks']);
  
  watch(selectedCategory, (newCategory) => {
    emit('category-changed', newCategory);
  });
  </script>
  