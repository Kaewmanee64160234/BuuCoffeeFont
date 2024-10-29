<template>
  <router-view v-if="!showMainMenu" />

  <MainMenu v-if="showMainMenu" />

  <LoadingDialog :loading="loadingStore.loading" />

  <!-- <UserManagement v-if="showMainMenu"/> -->

</template>

<script setup lang="ts">
import MainMenu from '@/components/MainLayout.vue';
import { useRouter } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from './stores/user.store';
import type { User } from './types/user.type';
import LoadingDialog from './components/LoadingDialog.vue';
import { useLoadingStore } from './stores/loading.store';
import { useAuthStore } from './stores/auth';
import UserManagement from './views/user/UserManagement.vue';

const router = useRouter();
const loadingStore = useLoadingStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const user = ref<User>({
  userId: null,
  name: null,
  email: null,
  token: null,

});
const showMainMenu = computed(() => {
  return user.value !== null && router.currentRoute.value.path !== '/login';
});
const getUserFromLocalStorage = () => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const userObject = JSON.parse(userString);
      userStore.setUser(userObject);
      authStore.isLogin = true;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      authStore.isLogin = false;
    router.push("/login");

    }
  } else {
    console.log("No user found in localStorage.");
    authStore.isLogin = false;
    router.push("/login");
    console.log("Redirect to login page");
  }
};


onMounted(() => {
  getUserFromLocalStorage();
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