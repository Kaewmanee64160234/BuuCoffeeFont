<template>
  <v-container class="fill-height d-flex align-center justify-center background-image" fluid >
    <v-card class="mx-auto my-12 pa-6" width="450" elevation="10">
      <v-row justify="center">
        <img src="../components/img/logo.jpg" alt="Logo" class="logo" style="width: 40%; height: 40%;">
      </v-row>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="อีเมลผู้ใช้งาน"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            :type="show ? 'text' : 'password'"
            label="รหัสผ่าน"
            required
            :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="show = !show"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn @click="loginHandler" class="login-btn">
          เข้าสู่ระบบ
        </v-btn>
      </v-card-actions>
    </v-card>
    <!-- <img src="../components/img/coffeeBaby1.png" alt="Character Top Left" class="character-top-left">
    <img src="../components/img/coffeeBaby2.png" alt="Character Bottom Right" class="character-bottom-right"> -->
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user.store';
const userStore = useUserStore()
const authStore = useAuthStore();
const router = useRouter();
const show = ref(false);

const valid = ref(false);
const email = ref('');
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
];
const password = ref('');
const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
];

const loginHandler = async () => {
  if (valid.value) {
    try {
      await authStore.login(email.value, password.value);
      if (userStore.currentUser.userId > 0 && userStore.currentUser.userEmail === email.value && userStore.currentUser.userPassword === password.value)
      Swal.fire({
        icon: 'success',
        title: 'Login successful',
        showConfirmButton: false,
        timer: 1500
      });
      // Redirect to '/report' after successful login
    } catch (error: any) {
      // Use 'error: any' to assert 'error' as any type or use a specific type if known
      console.error('Login failed:', error);
      if (error.response && error.response.data) {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: error.response.data.message || 'An error occurred',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'An unexpected error occurred',
        });
      }
    }
  } else {
    // Form validation failed, show warning message
    Swal.fire({
      icon: 'warning',
      title: 'Form is not valid',
      text: 'Please fill in the required fields correctly.',
    });
  }
};
</script>

<style scoped>
/* Default styles for large screens */
.v-card {
  width: 450px; /* Keep the original card width */
}

.character-top-left {
  position: absolute;
  left: 460px;
  top: 50px;
  width: 200px;
  height: auto;
}

.character-bottom-right {
  position: absolute;
  right: 450px;
  bottom: 60px;
  width: 180px;
  height: auto;
}

.background-image {
  background: url('../components/img/bg.jpg') no-repeat center center;
  background-size: cover;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Ensure the background is behind other elements */
}

/* For screens with a max width of 1024px (Tablets) */
@media (max-width: 1024px) {
  .v-card {
    width: 70%; /* Adjust the card width */
  }

  .character-top-left {
    left: 55%; /* Adjust character positioning */
    top: -10px;
    width: 150px; /* Scale down character */
  }

  .character-bottom-right {
    right: 55%;
    bottom: -10px;
    width: 150px; /* Scale down character */
  }

  .logo {
    width: 60%; /* Adjust logo size */
    height: auto;
  }
}

/* For screens with a max width of 600px (Mobile) */
@media (max-width: 600px) {
  .v-card {
    width: 90%; /* Make card width larger for small screens */
  }

  .character-top-left {
    position: fixed;
    left: 10%; /* เปอร์เซ็นต์จากขอบซ้าย */
    top: 10%; /* เปอร์เซ็นต์จากขอบบน */
    transform: translate(-50%, -50%); /* ปรับตำแหน่งให้ตรงกลาง */
    width: 15vw; /* ขนาดของรูป */
    height: auto;
  }
  
  .character-bottom-right {
    position: fixed;
    right: 10%; /* เปอร์เซ็นต์จากขอบขวา */
    bottom: 10%; /* เปอร์เซ็นต์จากขอบล่าง */
    transform: translate(50%, 50%); /* ปรับตำแหน่งให้ตรงกลาง */
    width: 15vw; /* ขนาดของรูป */
    height: auto;
  }
  

  .logo {
    width: 50%; /* Adjust logo size for mobile */
    height: auto;
  }
}
.login-btn {
  width: 40%;
  background-color: #CE9461;
  color: white;
  transition: transform 0.2s ease-in-out;
}
</style>
