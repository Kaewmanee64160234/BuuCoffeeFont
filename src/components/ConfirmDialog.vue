<script setup lang="ts">
import { ref, defineExpose } from "vue";
const dialog = ref(false);
const detail = ref("");
const title = ref("");
const agree = ref("Agree");

const cancel = ref("Cancel");
let onOk: (value: unknown) => void;
let onCancel: (value: unknown) => void;
const cancelBtn = () => {
  try {
    dialog.value = false;
    onCancel("cancel");
  } catch (e) {
    console.log(e);
  }
};
const okBtn = () => {
  dialog.value = false;
  onOk("Ok");
};
const openDialog = (
  title_: string,
  desc: string,
  okBtn: string = "Ok",
  cancel_: string = "Cancel"
) => {
  title.value = title_;
  detail.value = desc;
  agree.value = okBtn;
  cancel.value = cancel_;
  dialog.value = true;
  return new Promise((resolve, reject) => {
    onOk = resolve;
    onCancel = reject;
  });
};
defineExpose({ openDialog });
</script>
<template>
  <v-dialog v-model="dialog">
    <v-card class="mx-auto" max-width="344">
      <v-card-item>
        <v-card-title class="text-h5">{{ title }}</v-card-title>
        <v-card class="text-h8">{{ detail }}</v-card>
      </v-card-item>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="okBtn">
          {{ agree }}
        </v-btn>
        <v-btn color="red" variant="text" @click="cancelBtn">
          {{ cancel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
