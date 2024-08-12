<script lang="ts" setup>
import { defineProps, ref, watch, defineEmits  } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { VForm } from 'vuetify/components';
import Swal from 'sweetalert2';

const props = defineProps<{ dialog: boolean }>();
const emit = defineEmits(['update:dialog']);
const form = ref<VForm | null>(null);

const userName = ref('');
const userPassword = ref('');
const userEmail = ref('');
const userRole = ref('');
const userStatus = ref('');
const userStore = useUserStore();
const show = ref(false);

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
// Watch the dialog prop to reset the form when dialog opens
watch(() => props.dialog, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

function resetForm() {
  userName.value = '';
  userPassword.value = '';
  userEmail.value = '';
  userRole.value = '';
  userStatus.value = '';
  form.value?.resetValidation(); // รีเซ็ตการตรวจสอบ validation
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
        userStatus: userStatus.value
      });
      showSuccessDialog('ผู้ใช้งานรายนี้ถูกสร้างเรียบร้อยแล้ว!');
      
      // ปิด dialog หลังจากที่บันทึกเสร็จสิ้น
      closeDialog();

      // อัพเดตข้อมูลผู้ใช้งานทั้งหมด
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

// watch(() => userStore.createUserDialog, (newVal) => {
//   dialog.value = newVal;
// });

function closeDialog() {
  emit('update:dialog', false);  // ปิด dialog โดยส่งค่าใหม่กลับไปยัง parent
  resetForm();  // รีเซ็ตฟอร์มให้พร้อมสำหรับการใช้งานครั้งถัดไป
}

watch(() => props.dialog, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>

<template>
  <v-dialog :model-value="props.dialog" @update:model-value="value => emit('update:dialog', value)" max-width="800px">
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
                  :type="show ? 'text' : 'password'"
                  :rules="[rules.required, rules.password]"
                  required
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="show = !show"
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
                <v-select
                  v-model="userStatus"
                  label="สถานะผู้ใช้งาน"
                  :items="['ลาออกแล้ว', 'ยังไม่ลาออก']"
                  :rules="[rules.required]"
                  required
                ></v-select>
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
