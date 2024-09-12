<template>
  <v-app>
    <v-navigation-drawer
      v-if="shouldShowDrawer"
      v-model="drawer"
      :rail="rail"
      permanent
      app
    >
      <v-list-item class="drawer-header justify-end">
        <template v-slot:append>
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>
      <v-list-item-title v-if="!rail" class="username ml-2">ยินดีต้อนรับ คุณ {{ userStore.currentUser.userName }}</v-list-item-title>
      <v-list density="compact" nav>
        <v-subheader v-if="!rail">การขาย</v-subheader>
        <v-list-item to="/report">
          <template v-slot:prepend>
            <img src="../../src/components/img/dashboard.png" alt="รายงานสรุปผล" class="nav-icon" />
          </template>
          รายงานสรุปผล
        </v-list-item>

        <v-list-item to="/pos">
          <template v-slot:prepend>
            <img src="../../src/components/img/store.png" alt="การขาย" class="nav-icon" />
          </template>
          ระบบขาย
        </v-list-item>

        <v-list-item to="/historyReceipt">
          <template v-slot:prepend>
            <img src="../../src/components/img/receipt.png" alt="History Receipt" class="nav-icon" />
          </template>
          ประวัติการขาย
        </v-list-item>

        <!-- add subheader about เลี้ยงรับรอง -->
        <v-subheader v-if="!rail">เลี้ยงรับรอง</v-subheader>
        <v-list-item to="/pos-catering">
          <template v-slot:prepend>
            <img src="../../src/components/img/catering.png" alt="การเลี้ยงรับรอง" class="nav-icon" />
          </template>
          การเลี้ยงรับรอง
        </v-list-item>
        <!-- ประวัติการเลี้ยงรับรอง -->
        <v-list-item to="/historyReceiptCatering">
          <template v-slot:prepend>
            <img src="../../src/components/img/buffet.png" alt="ประวัติการเลี้ยงรับรอง" class="nav-icon" />
          </template>
          ประวัติการเลี้ยงรับรอง
        </v-list-item>

        <v-subheader v-if="!rail">จัดการสินค้าและผู้ใช้งาน</v-subheader>
        <v-list-item to="/productsManagement">
          <template v-slot:prepend>
            <img src="../../src/components/img/product.png" alt="จัดการสินค้า" class="nav-icon" />
          </template>
          จัดการสินค้า
        </v-list-item>

        <v-list-item to="/userManagement">
          <template v-slot:prepend>
            <img src="../../src/components/img/user.png" alt="จัดการผู้ใช้งาน" class="nav-icon" />
          </template>
          จัดการผู้ใช้งาน
        </v-list-item>

        <v-list-item to="/customersManagement">
          <template v-slot:prepend>
            <img src="../../src/components/img/customer.png" alt="จัดการลูกค้า" class="nav-icon" />
          </template>
          จัดการลูกค้า
        </v-list-item>

        <v-subheader v-if="!rail">โปรโมชันและหมวดหมู่</v-subheader>
        <v-list-item to="/promotion">
          <template v-slot:prepend>
            <img src="../../src/components/img/promotion.png" alt="จัดการโปรโมชัน" class="nav-icon" />
          </template>
          จัดการโปรโมชัน
        </v-list-item>

        <v-list-item to="/category">
          <template v-slot:prepend>
            <img src="../../src/components/img/inventory.png" alt="จัดการหมวดหมู่" class="nav-icon" />
          </template>
          จัดการหมวดหมู่
        </v-list-item>

        <v-list-item to="/topping">
          <template v-slot:prepend>
            <img src="../../src/components/img/topping.png" alt="จัดการท็อปปิ้ง" class="nav-icon" />
          </template>
          จัดการท็อปปิ้ง
        </v-list-item>

        <v-subheader @click="toggleIngredients">วัตถุดิบ</v-subheader>
        <v-expand-transition>
          <v-list v-show="showIngredients">
            <v-list-item to="/ingredientList">
              <template v-slot:prepend>
                <img src="../../src/components/img/groceries.png" alt="รายการวัตถุดิบ" class="nav-icon" />
              </template>
              คลังวัตถุดิบ
            </v-list-item>
            <v-list-item to="/ingredientCoffeeList">
              <template v-slot:prepend>
                <img src="../../src/components/img/coffee-beans.png" alt="รายการวัตถุดิบ" class="nav-icon" />
              </template>
              คลังร้านกาแฟ
            </v-list-item>

            <v-list-item to="/ingredientRiceList">
              <template v-slot:prepend>
                <img src="../../src/components/img/rice.png" alt="รายการวัตถุดิบ" class="nav-icon" />
              </template>
              คลังร้านข้าว
            </v-list-item>
            <v-list-item to="/ingredientCateringList">
              <template v-slot:prepend>
                <img src="../../src/components/img/buffet.png" alt="รายการเลี้ยงรับรอง" class="nav-icon" />
              </template>
              คลังวัตถุดิบร้านเลี้ยงรับรอง
            </v-list-item>
          </v-list>
        </v-expand-transition>

        <v-subheader v-if="!rail">อื่นๆ</v-subheader>
        <v-list-item @click="logout">
          <template v-slot:prepend>
            <img src="../../src/components/img/logo.jpg" alt="ออกจากระบบ" class="nav-icon" />
          </template>
          ออกจากระบบ
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

const showIngredients = ref(false)

const toggleIngredients = () => {
  showIngredients.value = !showIngredients.value
}

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
/* Default styles */
.v-navigation-drawer {
  width: 250px;
  background-color: #f2e4d8;
  transition: width 0.3s ease, left 0.3s ease; /* Add smooth transition */
}

.v-navigation-drawer.rail {
  width: 56px;
}

.v-list-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 56px;
  padding-left: 16px;
}

.v-list-item-title {
  font-weight: bold;
  margin-left: 16px;
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis (...) if text overflows */
}

.v-navigation-drawer.rail .v-list-item-title {
  display: none; /* Hide text when drawer is in rail mode */
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
  margin-right: 8px;
}

.drawer-header {
  background-color: #f5f5f5;
  padding: 16px;
}

.username {
  font-size: 18px;
}

.v-subheader {
  cursor: pointer;
}
.v-list {
  transition: max-height 0.5s ease-out;
  overflow: hidden;
}

</style>
