<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { VForm } from 'vuetify/components';
import Swal from 'sweetalert2';
import { useAuthorizeStore } from '@/stores/autorize.store';


const form = ref<VForm | null>(null);
const authorizeStore = useAuthorizeStore();
const userName = ref('');
const userPassword = ref('');
const userEmail = ref('');
const userRole = ref('');
const userStatus = ref('');
const userStore = useUserStore();  // Use store for dialog state
const show = ref(false);
const roles = ref<string[]>([]);

const rules = {
  required: (value: any) => !!value || 'กรุณากรอกข้อมูล',
  email: (value: string) => {
    const isValidEmail = /.+@.+\..+/.test(value);
    const hasThaiCharacters = /[ก-ฮ]/.test(value);

    if (!isValidEmail) {
      return 'กรุณากรอกอีเมลให้ถูกต้อง';
    }

    if (hasThaiCharacters) {
      return 'อีเมลต้องไม่เป็นภาษาไทย';
    }

    return true;
  },
  userName: (value: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(value) || 'กรุณากรอกชื่อเป็นตัวอักษรเท่านั้น',
  userStatus: (value: string) => /^[A-Za-zก-ฮะ-ๅๆ็่-๋์่-๋\s]+$/.test(value) || 'กรุณากรอกสถานะผู้ใช้งานเป็นตัวอักษรเท่านั้น',
  password: (value: string) => {
    const isValidLength = value.length >= 4;
    const hasEnglishLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasThaiChar = /[ก-ฮ]/.test(value);

    if (!isValidLength) {
      return 'รหัสผ่านต้องมีความยาวมากกว่า 4 ตัว';
    }
    if (!hasEnglishLetter) {
      return 'รหัสผ่านต้องประกอบด้วยอักขระและเป็นภาษาอังกฤษ';
    }
    if (!hasNumber) {
      return 'รหัสผ่านต้องประกอบด้วยตัวเลข';
    }
    if (!hasSpecialChar) {
      return 'รหัสผ่านต้องประกอบด้วยอักขระพิเศษ';
    }
    if (hasThaiChar) {
      return 'รหัสผ่านต้องเป็นภาษาอังกฤษเท่านั้น';
    }
    return true;
  },
};

// Watch the dialog state in the store to reset the form when it opens
watch(() => userStore.createUserDialog, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

// Load roles from authorizeStore when component is mounted
onMounted(async () => {
  await authorizeStore.getRoles(); // Assuming getRoles() fetches available roles
  roles.value = authorizeStore.roles.map(role => role.name); // Extract role names
});

// Watch for changes in authorizeStore.roles to update the roles available in the form
watch(
  () => authorizeStore.roles,
  (newRoles) => {
    roles.value = newRoles.map(role => role.name); // Update roles with new role names
  },
  { immediate: true }
);

function resetForm() {
  userName.value = '';
  userPassword.value = '';
  userEmail.value = '';
  userRole.value = '';
  userStatus.value = '';
  form.value?.resetValidation(); // Reset form validation
}

async function saveUser() {
  const { valid } = await form.value!.validate();
  if (valid) {
    try {
      await userStore.createUser({
        userId: 0,
        userName: userName.value,
        userPassword: userPassword.value,
        userEmail: userEmail.value,
        userRole: userRole.value,
        userStatus: userStatus.value,
        role: authorizeStore.roles.find(role => role.name === userRole.value) || null,
      });

      userStore.user = null;
      resetForm();
      showSuccessDialog('ผู้ใช้งานรายนี้ถูกสร้างเรียบร้อยแล้ว!');
      
      // Close the dialog after saving
      closeDialog();

      // Update user list
      await userStore.getAllUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showErrorDialog('เกิดข้อผิดพลาดขณะสร้างผู้ใช้งาน');
    }
  }
}

const showSuccessDialog = (message: string) => {
  Swal.fire({
    title: 'เสร็จสิ้น!',
    text: message,
    icon: 'success',
    confirmButtonText: 'ตกลง'
  });
};

function openDialog() {
  userStore.createUserDialog = true;  // Open the dialog through the store
}

function closeDialog() {
  userStore.createUserDialog = false;  // Close the dialog through the store
  resetForm();  // Reset the form for the next use
}

</script>

<template>
  <v-dialog v-model="userStore.createUserDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">เพิ่มผู้ใช้งาน</span>
      </v-card-title>
      <v-card-subtitle style="font-size: 16px;">เกี่ยวกับผู้ใช้งาน</v-card-subtitle>
      <v-card-text>
        <v-container>
          <!-- Add lazy-validation here -->
          <v-form ref="form" lazy-validation>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userName"
                  label="ชื่อผู้ใช้"
                  :rules="[rules.required, rules.userName]"
                  variant="solo"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userPassword"
                  label="รหัสผ่าน"
                  :type="show ? 'text' : 'password'"
                  :rules="[rules.required, rules.password]"
                  required
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  variant="solo"
                  @click:append="show = !show"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userEmail"
                  label="อีเมล"
                  :rules="[rules.required, rules.email]"
                  variant="solo"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userStatus"
                  label="สถานะผู้ใช้งาน"
                  :items="['ลาออกแล้ว', 'ยังไม่ลาออก']"
                  :rules="[rules.required]"
                  variant="solo"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userRole"
                  label="ตำแหน่งงาน"
                  :items="roles"
                  :rules="[rules.required]"
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
        <v-btn @click="closeDialog" style="font-size: 16px;">ยกเลิก</v-btn>
        <v-btn color="orange" @click="saveUser" style="font-size: 16px;">ต่อไป</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
