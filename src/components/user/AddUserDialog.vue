<script lang="ts" setup>
import { defineProps, ref, watch } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { VForm } from 'vuetify/components';

const props = defineProps<{ dialog: boolean }>();
const form = ref<VForm | null>(null);
const dialog = ref(props.dialog);

const userName = ref('');
const userPassword = ref('');
const userEmail = ref('');
const userRole = ref('');
const userStatus = ref('');
const userStore = useUserStore();

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูล',
  email: (value: string) => /.+@.+\..+/.test(value) || 'กรุณากรอกอีเมลให้ถูกต้อง',
  password: (value: string) => value.length >= 4 && /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(value) || 'รหัสผ่านต้องมีอักขระและมีความยาวมากกว่า 4 ตัว',
  userName: (value: string) => /^[A-Za-z]+$/.test(value) || 'กรุณากรอกชื่อเป็นตัวอักษรเท่านั้น',
  userStatus: (value: string) => /^[A-Za-z]+$/.test(value) || 'กรุณากรอกสถานะผู้ใช้งานเป็นตัวอักษรเท่านั้น',
};

watch(() => props.dialog, (newVal) => {
  dialog.value = newVal;
});

async function saveUser() {
  const { valid } = await form.value!.validate();
  if (valid) {
    await userStore.createUser({
      userId: 0,
      userName: userName.value,
      userPassword: userPassword.value,
      userEmail: userEmail.value,
      userRole: userRole.value,
      userStatus: userStatus.value
    });
    dialog.value = false;  // Close the dialog
    await userStore.getAllUsers();
  }
}

function closeDialog() {
  dialog.value = false;  // Close the dialog
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">เพิ่มผู้ใช้งาน</span>
      </v-card-title>
      <v-card-subtitle>เกี่ยวกับผู้ใช้งาน</v-card-subtitle>
      <v-card-text>
        <v-container>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userName"
                  label="ชื่อผู้ใช้"
                  :rules="[rules.required, rules.userName]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userPassword"
                  label="รหัสผ่าน"
                  type="password"
                  :rules="[rules.required, rules.password]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userEmail"
                  label="อีเมล"
                  :rules="[rules.required, rules.email]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userStatus"
                  label="สถานะผู้ใช้งาน"
                  :rules="[rules.required, rules.userStatus]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userRole"
                  label="ตำแหน่งงาน"
                  :items="['พนักงานขายกาแฟ', 'พนักงานขายข้าว', 'ผู้จัดการร้าน']"
                  :rules="[rules.required]"
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
        <v-btn color="orange" @click="saveUser">ต่อไป</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
