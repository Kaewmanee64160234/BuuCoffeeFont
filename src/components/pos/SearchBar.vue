<template>
    <v-text-field
      v-model="searchQuery.value"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      hide-details
    ></v-text-field>
  </template>
  
  <script lang="ts" setup>
import { ref, watch } from 'vue';
  
  const searchQuery = ref('');
  
  watch(searchQuery, (newQuery) => {
    emit('search', newQuery);
  });
  </script>
  