<script lang="ts" setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import {useUserStore} from '@/stores/user.store';
const props = defineProps<{ dialog: boolean }>();
const emit = defineEmits<{ (e: 'update:dialog', value: boolean): void }>();
import type { VForm } from 'vuetify/components';
const form = ref<VForm | null>(null);
const dialog = ref(props.dialog);

watch(() => props.dialog, (newVal) => {
  dialog.value = newVal;
});

async function saveUser() {
    const { valid } = await form.value!.validate();
if (valid) {
  //await useUserStore.createUser()
}

}

function closeDialog() {
  emit('update:dialog', false);
}

</script>

<template>
    <template>
        <v-dialog v-model="dialog" max-width="800px">
          <v-card>
            <v-card-title>
              <span class="text-h5">เพิ่มผู้ใช้งาน</span>
            </v-card-title>
            <v-card-subtitle>เกี่ยวกับผู้ใช้งาน</v-card-subtitle>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field label="ชื่อผู้ใช้" ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="รหัสผ่าน" type="password"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="อีเมล" ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      label="ตำแหน่งงาน"
                      item-text="name"
                      :items="[
                      'พนักงานขายกาแฟ',
                      'พนักงานขายข้าว',
                    ]"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="closeDialog">ยกเลิก</v-btn>
              <v-btn color="orange" @click="closeDialog" >ต่อไป</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
</template>

<style>
</style>