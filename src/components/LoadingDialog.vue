<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading.store';

const loadingDialog = useLoadingStore();
</script>

<template>
  <div v-if="loadingDialog.loading" class="custom-overlay">
    <div class="loading-container">
      <div class="loading-spinner">
        <v-progress-circular
          indeterminate
          color="brown darken-3"
          size="100"
          width="10"
        ></v-progress-circular>
      </div>
      <div class="loading-text">กรุณารอสักครู่...</div>
    </div>
  </div>
</template>

<style scoped>
.custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8); /* Light overlay background */
  z-index: 9999; /* Ensure it appears above all other elements */
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #3e2723; /* Dark Brown */
}

.loading-spinner {
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

.loading-icon {
  font-size: 50px;
}

.loading-text {
  font-weight: bold;
  margin-top: 20px;
  font-size: 1.2em;
  color: #4e342e; /* Coffee-like color */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
