<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthorizeStore } from '@/stores/autorize.store';
import type Groups from "@/types/authentorize/group.type";

const authorizeStore = useAuthorizeStore();
const isEditMode = ref(false); 

const snackbar = ref(false);
const snackbarMessage = ref("");
const selectedPermissions = ref<number[]>([]);

onMounted(async () => {
  await authorizeStore.getPermissions();
  
});

watch(() => authorizeStore.createGroupDialog, (isOpen) => {
  if (!isOpen) resetForm(); // Reset form on close
});
// watch for changes in the currentGroup data
watch(() => authorizeStore.currentGroup, (newGroup) => {
  selectedPermissions.value = newGroup.permissions!.map((p) => p.id);
});

const openEditDialog = (group:Groups) => {
  isEditMode.value = true;
  authorizeStore.currentGroup = { ...group }; // Set the selected group data to currentGroup
  authorizeStore.currentGroup.permissionIds = group.permissions!.map((p) => p.id); // Map permissions to IDs for checkboxes
  authorizeStore.createGroupDialog = true;
};

const resetForm = () => {
  authorizeStore.currentGroup = { name: "", permissions: [] }; // Clear currentGroup
  isEditMode.value = false;
};

const saveGroup = async () => {
  if (authorizeStore.currentGroup.name.length < 3) {
    snackbarMessage.value = "ชื่อกลุ่มต้องมีอย่างน้อย 3 ตัวอักษร";
    snackbar.value = true;
    return;
  }

  if (!selectedPermissions.value.length) {
    snackbarMessage.value = "กรุณาเลือกสิทธิ์การใช้งานอย่างน้อย 1 สิทธิ์";
    snackbar.value = true;
    return;
  }

  if (isEditMode.value && authorizeStore.currentGroup.groupId) {
    await authorizeStore.updateGroup({
      groupId: authorizeStore.currentGroup.groupId,
      name: authorizeStore.currentGroup.name,
      permissionIds: selectedPermissions.value,
    });
    snackbarMessage.value = "บันทึกการเปลี่ยนแปลงสำเร็จ!";
  } else {
    await authorizeStore.createGroup({
      name: authorizeStore.currentGroup.name,
      // permissions: authorizeStore.currentGroup.permissions,
      permissionIds: selectedPermissions.value,
    });
    snackbarMessage.value = "สร้างกลุ่มสำเร็จ!";
  }

  snackbar.value = true;

  resetForm();
  authorizeStore.createGroupDialog = false;

  await authorizeStore.getGroups(); 
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
      <v-card-title class="text-h6">{{ isEditMode ? "แก้ไขกลุ่มผู้ใช้งาน" : "สร้างกลุ่มผู้ใช้งาน" }}</v-card-title>
      <v-card-text>
        <!-- Group Name Input -->
        <v-text-field 
          variant="outlined" 
          v-model="authorizeStore.currentGroup.name" 
          label="ชื่อกลุ่ม" 
          outlined 
          :rules="[v => v.length >= 3 || 'ตัวอักษรอย่างน้อย 3 ตัว']"
        ></v-text-field>

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
                v-model="selectedPermissions"
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
        <v-btn color="primary" @click="saveGroup">{{ isEditMode ? "บันทึกการเปลี่ยนแปลง" : "สร้างกลุ่ม" }}</v-btn>
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
