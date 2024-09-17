<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { VForm } from 'vuetify/components';

const form = ref<VForm | null>(null);
const userStore = useUserStore();  // Use userStore to manage dialog and user details
const show = ref(false);

// Get user permissions based on the user role
const getUserPermissions = () => {
  const role = userStore.user?.userRole;

  switch (role) {
    case 'พนักงานขายกาแฟ':
      return [
        'สามารถขายสินค้าได้ทั้งร้านกาแฟ และงานเลี้ยงรับรอง คิดเงินและทอนเงินลูกค้าได้ ทำการจัดการสินค้าต่างๆได้ ทำการจัดการเกี่ยวกับลูกค้าได้ ทำการจัดการท็อปปิ้งได้ '
      ];
    case 'พนักงานขายข้าว':
      return [
        'สามารถขายสินค้าได้ทั้งร้านข้าว และงานเลี้ยงรับรอง คิดเงินและทอนเงินลูกค้าได้ ทำการจัดการสินค้าต่างๆได้ ทำการจัดการเกี่ยวกับลูกค้าได้ ทำการจัดการท็อปปิ้งได้ '
      ];
    case 'ผู้จัดการร้าน':
      return [
        'สามารถเข้าถึงหน้ารายงานผล หน้าการขายสินค้า หน้าการจัดการสินค้าต่างๆ จัดการลูกค้า หมวดหมู่ ผู้ใช้งาน ท็อปปิ้ง โปรโมชั่น และรายการวัตถุดิบได้ และสามารถดูรายการประวัติใบเสร็จได้'
      ];
    case 'พนักงานบัญชี':
      return ['สามารถดูประวัติใบเสร็จได้เท่านั้น'];
    default:
      return [];
  }
};

// Close the dialog by updating the store's state
function closeDialog() {
  userStore.detailUserDialog = false;
}

</script>

<template>
  <v-dialog v-model="userStore.detailUserDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">รายละเอียดผู้ใช้งาน</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6">
                <p>ชื่อผู้ใช้ : {{ userStore.user?.userName }}</p>
              </v-col>
              <v-col cols="12" md="6">
                <p>อีเมลผู้ใช้ : {{ userStore.user?.userEmail }}</p>
              </v-col>
              <v-col cols="12" md="6">
                <p>สถานะผู้ใช้ : {{ userStore.user?.userStatus }}</p>
              </v-col>
              <v-col cols="12" md="6">
                <p>ตำแหน่งผู้ใช้ : {{ userStore.user?.userRole }}</p>
              </v-col>
              <v-col cols="12" md="4">
                <p>รายละเอียดสิทธิเข้าใช้งาน :</p>
              </v-col>
              <v-col cols="12" md="8">
                <p>{{ getUserPermissions() }}</p>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
