<template>
  <v-app>
    <v-navigation-drawer
      v-if="shouldShowDrawer"
      v-model="drawer"
      :rail="rail"
      permanent
      app
    >
      <v-list-item class="drawer-header">
        <template v-slot:append>
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>
      <v-list-item-title>ยินดีต้อนรับ คุณ {{ userStore.currentUser.userName }}</v-list-item-title>
      <v-list density="compact" nav>
        <v-list-item to="/report">
          <template v-slot:prepend>
            <img src="../../src/components/img/dashboard.png" alt="Report" class="nav-icon" />
          </template>
          Report
        </v-list-item>

        <v-list-item to="/pos">
          <template v-slot:prepend>
            <img src="../../src/components/img/store.png" alt="POS" class="nav-icon" />
          </template>
          POS
        </v-list-item>

        <v-list-item to="/productsManagement">
          <template v-slot:prepend>
            <img src="../../src/components/img/product.png" alt="Products Management" class="nav-icon" />
          </template>
          Products Management
        </v-list-item>

        <v-list-item to="/userManagement">
          <template v-slot:prepend>
            <img src="../../src/components/img/user.png" alt="User Management" class="nav-icon" />
          </template>
          User Management
        </v-list-item>

        <v-list-item to="/customersManagement">
          <template v-slot:prepend>
            <img src="../../src/components/img/customer.png" alt="Customers Management" class="nav-icon" />
          </template>
          Customers Management
        </v-list-item>

        <v-list-item to="/promotion">
          <template v-slot:prepend>
            <img src="../../src/components/img/promotion.png" alt="Promotion Management" class="nav-icon" />
          </template>
          Promotion Management
        </v-list-item>

        <v-list-item to="/category">
          <template v-slot:prepend>
            <img src="../../src/components/img/inventory.png" alt="Category Management" class="nav-icon" />
          </template>
          Category Management
        </v-list-item>

        <v-list-item to="/topping">
          <template v-slot:prepend>
            <img src="../../src/components/img/topping.png" alt="Topping Management" class="nav-icon" />
          </template>
          Topping Management
        </v-list-item>

        <v-list-item to="/historyReceipt">
          <template v-slot:prepend>
            <img src="../../src/components/img/receipt.png" alt="History Receipt" class="nav-icon" />
          </template>
          History Receipt
        </v-list-item>

        <v-list-item to="/ingredientList">
          <template v-slot:prepend>
            <img src="../../src/components/img/groceries.png" alt="Ingredient List" class="nav-icon" />
          </template>
          Ingredient List
        </v-list-item>
        <v-list-item @click="logout">
          <template v-slot:prepend>
            <img src="../../src/components/img/logo.jpg" alt="Log Out" class="nav-icon" />
          </template>
          Log Out
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main :class="{ 'main-rail': rail }" style="margin: 0; padding: 0;" :style="{ marginLeft: isAuthenticated ? '0' : '3%' }">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { usePosStore } from '@/stores/pos.store'

const drawer = ref(true)
const rail = ref(true)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const posStore = usePosStore()

const isAuthenticated = computed(() => authStore.isLogin)

const shouldShowDrawer = computed(() => {
  return isAuthenticated.value && !posStore.hideNavigation
})

const getUserFromLocalStorage = () => {
  const userString = localStorage.getItem("user")
  if (userString) {
    try {
      const userObject = JSON.parse(userString)
      userStore.setUser(userObject)
      authStore.isLogin = true
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e)
      authStore.isLogin = false
    }
  } else {
    console.log("No user found in localStorage.")
    authStore.isLogin = false
    router.push("/login")
    console.log("Redirect to login page")
  }
}

onMounted(() => {
  getUserFromLocalStorage()
})

const logout = () => {
  authStore.logout()
  localStorage.removeItem("user")
  authStore.isLogin = false
  router.push("/login")
}
</script>

<style scoped>
.v-navigation-drawer {
  width: 250px;
}

.v-navigation-drawer.rail {
  width: 56px;
}

.v-list-item-title {
  font-weight: bold;
}

.v-app-bar {
  background-color: #f5f5f5;
  color: #333;
}

.v-main {
  padding: 20px;
  transition: margin-left 0.3s ease;
  margin-left: 250px;
}

.v-main.main-rail {
  margin-left: 56px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 16px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
}
</style>
