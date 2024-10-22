<template>
  <v-container>
    <v-row>
      <v-col class="mt-10">
        <div class="forbidden-page"  >
          <h1 class="mt-50" style="font-size: 50px;">ขออภัย</h1>
          <p style="font-size: 30px;">คุณไม่ได้รับอนุญาตให้เข้าสู่หน้าจอนี้</p>
          <!-- ใส่ปุ่มกลับสู่หน้าหลักหากต้องการ -->
          <!-- <v-btn @click="goToPage()" class="mt-3">กลับสู่หน้าหลัก</v-btn> -->
          <!-- รูปภาพ -->
          <v-img 
            src="../../src/components/img/rejectedWomen.png"
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
import router from '@/router';
import { useUserStore } from '@/stores/user.store';

  const userStore = useUserStore();
  const goToPage = ()=>{
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

  }
  </script>
  
  <style scoped>
  .forbidden-page {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  </style>
  