<template v-if="userStore.currentUser && userStore.currentUser.role">
  <v-app>
    <v-navigation-drawer
      v-if="shouldShowDrawer"
      v-model="drawer"
      :rail="rail"
      permanent
      app
    >
      <v-list-item class="drawer-header justify-end ml-9">
        <template v-slot:append>
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            @click.stop="toggleRail"
          ></v-btn>
        </template>
      </v-list-item>
      <v-list-item-title v-if="!rail" class="username ml-2"
        >ยินดีต้อนรับ คุณ
        {{ userStore.currentUser.userName }}</v-list-item-title
      >

      <v-list density="compact" nav>
        <!-- การขาย -->
        <v-subheader @click="toggleSale" class="menu-item d-flex align-center"
        v-if="hasPermission('ดูรายงาน') || hasPermission('สามารถขายได้') || hasPermission('แก้ไขใบเสร็จ')">
         
        
          <img
            src="../../src/components/img/sell.png"
            alt="การขาย"
            class="nav-icon"
          />
          <span v-if="!rail">การขาย</span>
          <v-icon class="menu-icon">{{
            showSale ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-subheader>

        <v-expand-transition>
          <v-list v-show="showSale" style="padding-left: 33px">
            <v-list-item to="/report" v-if="hasPermission('ดูรายงาน')">
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/dashboard.png"
                  alt="รายงานสรุปผล"
                  class="nav-icon"
                />
              </template>
              รายงานสรุปผล
            </v-list-item>

            <v-list-item to="/pos-coffee" v-if="hasPermission('สามารถขายได้')">
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/store.png"
                  alt="การขาย"
                  class="nav-icon"
                />
              </template>
              POSร้านกาแฟ
            </v-list-item>

            <v-list-item
              to="/pos-rice"
              v-if="
                userStore.currentUser?.role?.name !== 'พนักงานขายกาแฟ' &&
                hasPermission('สามารถขายได้')
              "
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/store.png"
                  alt="การขาย"
                  class="nav-icon"
                />
              </template>
              POSร้านข้าว
            </v-list-item>

            <v-list-item
              to="/historyReceipt"
              v-if="hasPermission('แก้ไขใบเสร็จ')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/receipt.png"
                  alt="ประวัติการขาย"
                  class="nav-icon"
                />
              </template>
              ประวัติการขาย
            </v-list-item>
          </v-list>
        </v-expand-transition>

        <!-- วัตถุดิบ -->
        <v-subheader
          @click="toggleIngredients"
          class="menu-item d-flex align-center"
          v-if="
          hasPermission('ดูวัตถุดิบ') ||
          hasPermission('จัดการวัตถุดิบ') 

          "
        >
          <img
            src="../../src/components/img/ingredients.png"
            alt="วัตถุดิบ"
            class="nav-icon"
          />
          <span v-if="!rail">วัตถุดิบ</span>
          <v-icon class="menu-icon">{{
            showIngredients ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-subheader>

        <v-expand-transition>
          <v-list v-show="showIngredients" style="padding-left: 33px">
            <v-list-item
              to="/ingredientList"
              v-if="hasPermission('ดูวัตถุดิบ')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/groceries.png"
                  alt="รายการวัตถุดิบ"
                  class="nav-icon"
                />
              </template>
              คลังวัตถุดิบ
            </v-list-item>

            <v-list-item
              to="/ingredientCoffeeList"
              v-if="hasPermission('ดูวัตถุดิบ')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/coffee-beans.png"
                  alt="รายการวัตถุดิบ"
                  class="nav-icon"
                />
              </template>
              คลังร้านกาแฟ
            </v-list-item>

            <v-list-item
              to="/ingredientRiceList"
              v-if="hasPermission('ดูวัตถุดิบ')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/rice.png"
                  alt="รายการวัตถุดิบ"
                  class="nav-icon"
                />
              </template>
              คลังร้านข้าว
            </v-list-item>
          </v-list>
        </v-expand-transition>

        <!-- เลี้ยงรับรอง -->
        <v-subheader
          @click="toggleCatering"
          class="menu-item d-flex align-center"
          v-if="
          hasPermission('จัดการการเลี้ยงรับรอง') ||
          hasPermission('ดูประวัติการเลี้ยงรับรอง') 

          "
        >
          <img
            src="../../src/components/img/cateringProfile.png"
            alt="เลี้ยงรับรอง"
            class="nav-icon"
          />
          <span v-if="!rail">เลี้ยงรับรอง</span>
          <v-icon class="menu-icon">{{
            showCatering ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-subheader>

        <v-expand-transition>
          <v-list v-show="showCatering" style="padding-left: 33px">
            <v-list-item
              to="/pos-catering"
              v-if="hasPermission('จัดการการเลี้ยงรับรอง')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/catering.png"
                  alt="การเลี้ยงรับรอง"
                  class="nav-icon"
                />
              </template>
              การเลี้ยงรับรอง
            </v-list-item>

            <v-list-item
              to="/historyReceiptCatering"
              v-if="hasPermission('จัดการการเลี้ยงรับรอง')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/buffet.png"
                  alt="ประวัติการเลี้ยงรับรอง"
                  class="nav-icon"
                />
              </template>
              ประวัติการเลี้ยงรับรอง
            </v-list-item>
          </v-list>
        </v-expand-transition>

        <!-- จัดการสินค้าและผู้ใช้งาน -->
        <v-subheader
          @click="toggleProductUserManagement"
          class="menu-item d-flex align-center"
          v-if="
          hasPermission('ดูรายการสินค้า') ||
          hasPermission('จัดการผู้ใช้') ||
          hasPermission('จัดการสิทธิ์เข้าถึง') ||
          hasPermission('ดูข้อมูลลูกค้า')
          "
        >
          <img
            src="../../src/components/img/evaluation.png"
            alt="จัดการสินค้าและผู้ใช้งาน"
            class="nav-icon"
          />
          <span v-if="!rail">จัดการสินค้าและผู้ใช้งาน</span>
          <v-icon class="menu-icon">{{
            showProductUserManagement ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-subheader>

        <v-expand-transition>
          <v-list v-show="showProductUserManagement" style="padding-left: 33px">
            <v-list-item
              to="/productsManagement"
              v-if="hasPermission('ดูรายการสินค้า')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/product.png"
                  alt="จัดการสินค้า"
                  class="nav-icon"
                />
              </template>
              จัดการสินค้า
            </v-list-item>

            <v-list-item
              to="/userManagement"
              v-if="hasPermission('จัดการผู้ใช้')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/man.png"
                  alt="จัดการผู้ใช้งาน"
                  class="nav-icon"
                />
              </template>
              จัดการผู้ใช้งาน
            </v-list-item>
            <v-list-item
              to="/managementRole"
              v-if="hasPermission('จัดการสิทธิ์เข้าถึง')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/user.png"
                  alt="จัดการผู้ใช้งาน"
                  class="nav-icon"
                />
              </template>
              จัดการสิทธิ์ผู้ใช้งาน
            </v-list-item>

            <v-list-item
              to="/customersManagement"
              v-if="hasPermission('ดูข้อมูลลูกค้า')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/customer.png"
                  alt="จัดการลูกค้า"
                  class="nav-icon"
                />
              </template>
              จัดการลูกค้า
            </v-list-item>
          </v-list>
        </v-expand-transition>

        <!-- โปรโมชันและหมวดหมู่ -->
        <v-subheader
          @click="togglePromotionCategory"
          class="menu-item d-flex align-center"
          v-if="
          hasPermission('จัดการโปรโมชั่น') ||
          hasPermission('จัดการประเภทสินค้า') ||
          hasPermission('จัดการท้อปปิ้ง')
          
          "
        >
          <img
            src="../../src/components/img/box.png"
            alt="โปรโมชันและหมวดหมู่"
            class="nav-icon"
          />
          <span v-if="!rail">โปรโมชันและหมวดหมู่</span>
          <v-icon class="menu-icon">{{
            showPromotionCategory ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-subheader>

        <v-expand-transition>
          <v-list v-show="showPromotionCategory" style="padding-left: 33px">
            <v-list-item
              to="/promotion"
              v-if="hasPermission('จัดการโปรโมชั่น')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/promotion.png"
                  alt="จัดการโปรโมชัน"
                  class="nav-icon"
                />
              </template>
              จัดการโปรโมชัน
            </v-list-item>

            <v-list-item
              to="/category"
              v-if="hasPermission('จัดการประเภทสินค้า')"
            >
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/inventory.png"
                  alt="จัดการหมวดหมู่"
                  class="nav-icon"
                />
              </template>
              จัดการหมวดหมู่
            </v-list-item>

            <v-list-item to="/topping" v-if="hasPermission('จัดการท้อปปิ้ง')">
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/topping.png"
                  alt="จัดการท็อปปิ้ง"
                  class="nav-icon"
                />
              </template>
              จัดการท็อปปิ้ง
            </v-list-item>
          </v-list>
        </v-expand-transition>

        <!-- อื่นๆ -->
        <v-subheader
          @click="toggleOthers"
          class="menu-item d-flex align-center"
        >
          <img
            src="../../src/components/img/logo.jpg"
            alt="อื่นๆ"
            class="nav-icon"
          />
          <span v-if="!rail">อื่นๆ</span>
          <v-icon class="menu-icon">{{
            showOthers ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-subheader>

        <v-expand-transition>
          <v-list v-show="showOthers" style="padding-left: 33px">
            <v-list-item @click="logout">
              <template v-slot:prepend>
                <img
                  src="../../src/components/img/power.png"
                  alt="ออกจากระบบ"
                  class="nav-icon"
                />
              </template>
              ออกจากระบบ
            </v-list-item>
          </v-list>
        </v-expand-transition>
      </v-list>
    </v-navigation-drawer>

    <v-main
      :class="{ 'main-rail': rail }"
      style="margin: 0; padding: 0"
      :style="{ marginLeft: isAuthenticated ? '0' : '3%' }"
    >
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user.store";
import { usePosStore } from "@/stores/pos.store";

const drawer = ref(true);
const rail = ref(true);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const posStore = usePosStore();

const isAuthenticated = computed(() => authStore.isLogin);

const shouldShowDrawer = computed(() => {
  return isAuthenticated.value && !posStore.hideNavigation;
});

const showSale = ref(false);
const showCatering = ref(false);
const showProductUserManagement = ref(false);
const showPromotionCategory = ref(false);
const showIngredients = ref(false);
const showOthers = ref(false);

const hasPermission = (permission) => {
  return userStore.currentUser?.groups?.some((group) =>
    group.permissions.some((p) => p.name === permission)
  );
};

const toggleSale = () => {
  showSale.value = rail.value ? false : !showSale.value; // ปิดเมนูถ้า rail เป็น true, สลับสถานะถ้า rail เป็น false
};

const toggleCatering = () => {
  showCatering.value = rail.value ? false : !showCatering.value; // ปิดเมนูถ้า rail เป็น true, สลับสถานะถ้า rail เป็น false
};

const toggleProductUserManagement = () => {
  showProductUserManagement.value = rail.value
    ? false
    : !showProductUserManagement.value; // ปิดเมนูถ้า rail เป็น true, สลับสถานะถ้า rail เป็น false
};

const togglePromotionCategory = () => {
  showPromotionCategory.value = rail.value
    ? false
    : !showPromotionCategory.value; // ปิดเมนูถ้า rail เป็น true, สลับสถานะถ้า rail เป็น false
};

const toggleIngredients = () => {
  showIngredients.value = rail.value ? false : !showIngredients.value; // ปิดเมนูถ้า rail เป็น true, สลับสถานะถ้า rail เป็น false
};

const toggleOthers = () => {
  showOthers.value = rail.value ? false : !showOthers.value; // ปิดเมนูถ้า rail เป็น true, สลับสถานะถ้า rail เป็น false
};

const toggleRail = () => {
  rail.value = !rail.value;
  if (rail.value) {
    showSale.value = false;
    showCatering.value = false;
    showProductUserManagement.value = false;
    showPromotionCategory.value = false;
    showIngredients.value = false;
    showOthers.value = false;
  }
};

onMounted(() => {
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
});

const logout = () => {
  authStore.logout();
  localStorage.removeItem("user");
  authStore.isLogin = false;
  router.push("/login");
};
</script>

<style scoped>
/* Default styles */
.v-navigation-drawer {
  width: 250px;
  background-color: #f2e4d8; /* Background color for the entire drawer */
  transition: width 0.3s ease, left 0.3s ease; /* Add smooth transition */
}

.v-navigation-drawer.rail {
  width: 66px;
}

.v-list .v-list-item {
  padding-left: 30px; /* Adjust this value for the desired indentation */
}

.v-list-item-title {
  font-weight: bold;
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis if text overflows */
}

.v-app-bar {
  background-color: #f2e4d8; /* Same color as the navigation drawer */
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
  margin-right: 10px; /* Space between image and text */
}

.drawer-header {
  background-color: #f2e4d8; /* Match the color of the navigation drawer */
  padding: 16px;
}

.username {
  font-size: 18px;
}

.v-subheader {
  cursor: pointer;
  padding-left: 16px;
}

.v-list {
  transition: max-height 0.5s ease-out;
  overflow: hidden;
}

.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Align items to the left */
  padding: 0 8px;
  height: 48px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px; /* Minimal space between the image and text */
}

.menu-icon {
  margin-left: auto; /* Push the arrow icon to the far right */
}

.v-navigation-drawer.rail .menu-item {
  justify-content: center; /* Center the image when the drawer is collapsed */
}

.v-navigation-drawer.rail .menu-icon,
.v-navigation-drawer.rail span {
  display: none; /* Hide the text and arrow icon when the drawer is in rail mode */
}
</style>
