<template>
  <v-dialog v-model="dialog" max-width="800px">
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
                <v-text-field v-model="userName" label="ชื่อผู้ใช้" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="userPassword" label="รหัสผ่าน" type="password" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="userEmail" label="อีเมล" required></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="userStatus" label="สถานะผู้ใช้งาน" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="userRole"
                  label="ตำแหน่งงาน"
                  :items="['พนักงานขายกาแฟ', 'พนักงานขายข้าว', 'ผู้จัดการร้าน']"
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
import { defineProps, defineEmits, ref, watch } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { VForm } from 'vuetify/components';
import type { User } from '@/types/user.type';

const props = defineProps<{ dialog: boolean, user: User | null }>();
const emit = defineEmits<{ (e: 'update:dialog', value: boolean): void }>();
const form = ref<VForm | null>(null);
const dialog = ref(props.dialog);

watch(() => props.dialog, (newVal) => {
  dialog.value = newVal;
});

const userStore = useUserStore();

const userName = ref(props.user?.userName || '');
const userPassword = ref(props.user?.userPassword || '');
const userEmail = ref(props.user?.userEmail || '');
const userRole = ref(props.user?.userRole || '');
const userStatus = ref(props.user?.userStatus || '');

watch(() => props.user, (newVal) => {
  userName.value = newVal?.userName || '';
  userPassword.value = newVal?.userPassword || '';
  userEmail.value = newVal?.userEmail || '';
  userRole.value = newVal?.userRole || '';
  userStatus.value = newVal?.userStatus || '';
});

async function saveUser() {
  const { valid } = await form.value!.validate();
  if (valid) {
    const updatedUser: User = {
      userId: props.user?.userId || 0,
      userName: userName.value,
      userPassword: userPassword.value,
      userEmail: userEmail.value,
      userRole: userRole.value,
      userStatus: userStatus.value,
    };

    await userStore.updateUser(updatedUser.userId, updatedUser);
    emit('update:dialog', false);
    await userStore.getAllUsers();
  }
}

function closeDialog() {
  emit('update:dialog', false);
}

</script>

<style scoped>
</style>
