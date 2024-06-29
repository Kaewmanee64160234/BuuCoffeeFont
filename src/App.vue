<template>
  <MainMenu v-if="showMainMenu" />
  <router-view v-if="!showMainMenu" />
</template>

<script setup lang="ts">
import MainMenu from '@/components/MainLayout.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
const router = useRouter();

const showMainMenu = computed(() => {
  return router.currentRoute.value.path !== '/login';
});
</script>

<style >
/* font kanit */
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300&display=swap');
/* font kanit */
* {
  font-family: 'Kanit', sans-serif;
}
/* Webkit-based browsers */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1; 
}

::-webkit-scrollbar-thumb {
  background: #888; 
  border-radius: 6px;
  border: 3px solid #f1f1f1;
}

::-webkit-scrollbar-thumb:hover {
  background: #555; 
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

/* Edge, IE 10+ */
*::-ms-scrollbar {
  width: 12px;
  height: 12px;
}

*::-ms-scrollbar-track {
  background: #f1f1f1; 
}

*::-ms-scrollbar-thumb {
  background: #888; 
  border-radius: 6px;
  border: 3px solid #f1f1f1;
}

*::-ms-scrollbar-thumb:hover {
  background: #555; 
}
</style>