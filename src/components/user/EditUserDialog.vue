<template>
  <v-dialog v-model="userStore.updateUserDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">แก้ไขผู้ใช้งาน</span>
      </v-card-title>
      <v-card-subtitle>เกี่ยวกับผู้ใช้งาน</v-card-subtitle>
      <v-card-text>
        <v-container>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="userName" label="ชื่อผู้ใช้" variant="solo" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="userPassword" 
                  label="รหัสผ่าน" 
                  :type="show ? 'text' : 'password'"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="solo"
                  @click:append="show = !show"
                  required
                  :disabled="true"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field v-model="userEmail" label="อีเมล" variant="solo" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="userStatus" 
                  label="สถานะผู้ใช้งาน" 
                  :items="['ลาออกแล้ว', 'ยังไม่ลาออก']"
                  variant="solo"
                  required>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userRole"
                  label="ตำแหน่งงาน"
                  :items="[
                    'พนักงานขายกาแฟ',
                    'พนักงานขายข้าว',
                  ]"
                  variant="solo"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog">ยกเลิก</v-btn>
        <v-btn color="orange" @click="saveUser">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { VForm } from 'vuetify/components';
import Swal from 'sweetalert2';

const form = ref<VForm | null>(null);
  const userStore = useUserStore();

const show = ref(false);

const userName = ref(userStore.user?.userName || '');
const userPassword = ref(userStore.user?.userPassword || '');
const userEmail = ref(userStore.user?.userEmail || '');
const userRole = ref(userStore.user?.userRole || '');
const userStatus = ref(userStore.user?.userStatus || '');

// Validation rules
// const statusRules = [
//   (v: string) => !!v || 'สถานะผู้ใช้งานจำเป็นต้องระบุ',
//   (v: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(v) || 'กรุณากรอกสถานะผู้ใช้งานเป็นตัวอักษรเท่านั้น'
// ];


watch(() => userStore.user, (newVal) => {
  userName.value = newVal?.userName || '';
  userPassword.value = newVal?.userPassword || '';
  userEmail.value = newVal?.userEmail || '';
  userRole.value = newVal?.userRole || '';
  userStatus.value = newVal?.userStatus || '';
});

async function saveUser() {
  const { valid } = await form.value!.validate();
  if (valid) {
    const updatedUser = {
      userId: userStore.user?.userId || 0,
      userName: userName.value,
      userPassword: userPassword.value,
      userEmail: userEmail.value,
      userRole: userRole.value,
      userStatus: userStatus.value,
    };

    userStore.user = null;

    try {
      const response = await userStore.updateUser(updatedUser.userId, updatedUser);
      if (response) {
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'แก้ไขผู้ใช้งานเสร็จสิ้น!',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
   
        userStore.updateUserDialog = false;
        await userStore.getAllUsers();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดขณะแก้ไขผู้ใช้งาน',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }
}

function closeDialog() {
  userStore.updateUserDialog = false;
}
</script>

<style scoped>
</style>
