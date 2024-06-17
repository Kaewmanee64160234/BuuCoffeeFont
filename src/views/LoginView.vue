
<template>
  <v-container class="fill-height d-flex align-center justify-center background-image" fluid>
    <v-card class="mx-auto my-12 pa-6" width="450" elevation="10">
      <v-row justify="center">
        <img src="../components/img/logo.jpg" alt="Logo" class="logo" style="width: 40%; height: 40%;">
      </v-row>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="Email"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            :type="show ? 'text' : 'password'"
            label="Password"
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
    <img src="../components/img/coffeeBaby1.png" alt="Character Top Left" class="character-top-left">
    <img src="../components/img/coffeeBaby2.png" alt="Character Bottom Right" class="character-bottom-right">
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';

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
      // Login successful, show success message
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
.headline {
  text-align: center;
  font-size: 24px;
  margin-top: 10px;
}

.logo {
  width: 80px;
  height: 80px;
}

.v-btn {
  width: 100%;
}

.fill-height {
  height: 100vh;
}

.white--text {
  color: #fff !important;
}

.background-image {
  background: url('../components/img/bg.jpg') no-repeat center center;
  background-size: cover;
}

.character-top-left {
  position: absolute;
  top: 50px; /* Adjust position */
  left: 460px; /* Adjust position */
  width: 200px; /* Adjust size as needed */
  height: auto;
  z-index: 1; /* Ensure it is above the card */
}

.character-bottom-right {
  position: absolute;
  bottom: 60px; /* Adjust position */
  right: 450px; /* Adjust position */
  width: 180px; /* Adjust size as needed */
  height: auto;
  z-index: 1; /* Ensure it is above the card */
}

.v-btn.login-btn {
  width: 50%;
  border: 2px solid #C5C5C5; /* เพิ่มเส้นขอบให้ปุ่ม */
  color: #2B28A3;
  text-transform: uppercase;
  font-weight: bold;
}

.v-btn.login-btn:hover {
  background-color: #C5C5C5;
  color: white;
}
</style>
