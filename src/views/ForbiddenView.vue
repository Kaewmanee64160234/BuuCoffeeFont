<template>
    <div class="forbidden-page">
      <h1>403 - Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <v-btn @click="goToPage()" >Go to Home</v-btn>
    </div>
  </template>
  
  <script setup lang="ts">
import router from '@/router';
import { useUserStore } from '@/stores/user.store';

  const userStore = useUserStore();
  const goToPage = ()=>{
    if(userStore.currentUser.role.name === 'ผู้จัดการร้าน'){
        router.push('/report');
    }else{
        router.push('/pos');
    }

  }
  </script>
  
  <style scoped>
  .forbidden-page {
    text-align: center;
    margin-top: 100px;
  }
  </style>
  