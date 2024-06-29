<template>
    <v-container class="text-center fill-height d-flex align-center justify-center">
      <div>
        <v-icon large>mdi-coffee-off-outline</v-icon>
        <h1>Oops! Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <v-btn color="primary" @click="goHome">Go to Home</v-btn>
      </div>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const goHome = () => {
    router.push('/');
  };
  </script>
  
  <style scoped>
  h1 {
    margin-bottom: 16px;
  }
  </style>
  