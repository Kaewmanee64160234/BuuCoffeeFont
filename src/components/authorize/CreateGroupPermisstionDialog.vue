<script setup lang="ts">
import { useAuthorizeStore } from '@/stores/autorize.store';
import { ref, onMounted } from 'vue';

const authorizeStore = useAuthorizeStore();
const newGroupPermissions = ref<number[]>([]);
const newGroupName = ref("");
const newGroupDescription = ref("");

// Snackbar for showing error messages
const snackbar = ref(false);
const snackbarMessage = ref("");

// Load permissions when component mounts
onMounted(async () => {
  await authorizeStore.getPermissions();
});

const createGroup = async () => {
  // Validate group name length and permissions
  if (newGroupName.value.length < 3) {
    snackbarMessage.value = "ชื่อกลุ่มต้องมีอย่างน้อย 3 ตัวอักษร";
    snackbar.value = true;
    return;
  }

  if (!newGroupPermissions.value.length) {
    snackbarMessage.value = "กรุณาเลือกสิทธิ์การใช้งานอย่างน้อย 1 สิทธิ์";
    snackbar.value = true;
    return;
  }

  // Create the group
  await authorizeStore.createGroup({
    name: newGroupName.value,
    permissionIds: newGroupPermissions.value,
  });

  // Show success message in snackbar
  snackbarMessage.value = "สร้างกลุ่มสำเร็จ!";
  snackbar.value = true;

  // Clear inputs and close dialog
  newGroupName.value = "";
  newGroupDescription.value = "";
  newGroupPermissions.value = [];
  authorizeStore.createGroupDialog = false;

  await authorizeStore.getGroups(); // Refresh the groups list
};
</script>

<template>
  <v-dialog
    v-model="authorizeStore.createGroupDialog"
    persistent
    max-width="800px"
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title class="text-h6">สร้างกลุ่มผู้ใช้งาน</v-card-title>
      <v-card-text>
        <!-- Group Name Input -->
        <v-text-field 
          variant="outlined" 
          v-model="newGroupName" 
          label="ชื่อกลุ่ม" 
          outlined 
          :rules="[v => v.length >= 3 || 'ตัวอักษรอย่างน้อย 3 ตัว']"
        ></v-text-field>

        <!-- Description (Optional) -->
        <v-expand-transition>
          <v-textarea v-if="newGroupDescription" v-model="newGroupDescription" label="คำอธิบาย (ไม่บังคับ)" outlined></v-textarea>
        </v-expand-transition>

        <!-- Permission Checklist -->
        <div class="permission-checklist">
          <h4 class="text-subtitle-1 mb-2">เลือกสิทธิ์ในการใช้งาน</h4>
          <v-row class="flex-wrap">
            <v-col
              v-for="permission in authorizeStore.permissions"
              :key="permission.id"
              cols="12" sm="6"
              class="no-horizontal-scroll"
            >
              <v-checkbox
                v-model="newGroupPermissions"
                :label="permission.name"
                :value="permission.id"
              ></v-checkbox>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="authorizeStore.createGroupDialog = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="createGroup">สร้างกลุ่ม</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar for showing messages -->
    <v-snackbar v-model="snackbar" timeout="3000" color="red" top>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<style scoped>
.permission-checklist {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}
.no-horizontal-scroll {
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}
</style>
