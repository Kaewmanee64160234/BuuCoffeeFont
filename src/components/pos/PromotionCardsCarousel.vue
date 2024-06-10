<template>
    <v-carousel>
      <v-carousel-item v-for="(promotion, i) in promotions" :key="i">
        <v-card>
          <v-card-title>{{ promotion.title }}</v-card-title>
          <v-card-actions>
            <v-btn color="orange" @click="applyPromotion(promotion)">{{ promotion.buttonText }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-carousel-item>
    </v-carousel>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  
  interface Promotion {
    title: string;
    buttonText: string;
  }
  
  const promotions = ref<Promotion[]>([
    { title: 'Buy 1 Get 1 Free', buttonText: 'Apply Promotion' },
    { title: 'Use Reward Points', buttonText: 'Apply Promotion' },
    { title: 'Discount on Bring Your Own Cup', buttonText: 'Apply Promotion' },
    { title: '50% Off', buttonText: 'Apply Promotion' },
  ]);
  
  function applyPromotion(promotion: Promotion) {
    // Handle promotion application logic
    console.log('Promotion applied:', promotion);
  }
  </script>
  
  <style scoped>
  .v-carousel-item {
    height: 200px;
  }
  </style>
  