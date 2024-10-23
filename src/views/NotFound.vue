<template>
  <v-container>
    <v-row>
      <v-col class="mt-10">
        <div class="notfound-page"  >
          <h1 class="mt-50" style="font-size: 50px;">ขออภัย</h1>
          <p style="font-size: 30px;">ไม่พบหน้าจอที่คุณต้องการ</p>
          <!-- ใส่ปุ่มกลับสู่หน้าหลักหากต้องการ -->
          <!-- <v-btn @click="goToPage()" class="mt-3">กลับสู่หน้าหลัก</v-btn> -->
          <!-- รูปภาพ -->
          <v-img 
            src="../../src/components/img/rejected.png"
            width="280" 
            height="280"
            class="rounded-card mt-8 ml-50">
          </v-img>
        </div>
      </v-col>
    </v-row>
  </v-container>
  </template>
  
  <script setup lang="ts">
  import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const userStore = useUserStore();
  const goHome = () => {
    if(userStore.currentUser.role.name === 'ผู้จัดการร้าน'){
      router.push('/report');
    }
    if(userStore.currentUser.role.name === 'พนักงานขายกาแฟ'){
      router.push('/pos-coffee');
    }
    if(userStore.currentUser.role.name === 'พนักงานขายข้าว'){
      router.push('/pos-rice');
    }else{
      router.push('/report');

    }
  };
  </script>
  
  <style scoped>
  .notfound-page {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  </style>
  