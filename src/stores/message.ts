import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useMessageStore = defineStore("message", () => {
  const snackbar = ref(false);
  const message = ref("");

  function showError(text: string) {
    message.value = text;
    snackbar.value = true;
  }
  return { snackbar, message, showError };
});

