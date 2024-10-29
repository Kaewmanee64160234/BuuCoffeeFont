<template>
  <v-dialog
    v-model="authorizeStore.createGroupDialog"
    persistent
    max-width="800px"
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title class="text-h6">{{
        isEditMode ? "แก้ไขกลุ่มผู้ใช้งาน" : "สร้างกลุ่มผู้ใช้งาน"
      }}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- Group Name and Permissions Section -->
        <v-expansion-panels multiple>
          <v-expansion-panel>
            <v-expansion-panel-header> ตั้งค่าสิทธิ์ </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-text-field
                variant="outlined"
                v-model="authorizeStore.currentGroup.name"
                label="ชื่อกลุ่ม"
                :rules="[(v) => v.length >= 3 || 'ตัวอักษรอย่างน้อย 3 ตัว']"
                outlined
                dense
                class="mb-4"
              ></v-text-field>

              <h4 class="text-subtitle-1 mb-2">เลือกสิทธิ์ในการใช้งาน</h4>
              <v-row class="permission-checklist">
                <v-col
                  v-for="permission in authorizeStore.permissions"
                  :key="permission.id"
                  cols="12"
                  sm="6"
                >
                  <v-checkbox
                    v-model="selectedPermissions"
                    :label="permission.name"
                    :value="permission.id"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Users Selection Section -->
          <v-expansion-panel>
            <v-expansion-panel-header> เลือกผู้ใช้ </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-text-field
                v-model="searchQuery"
                label="ค้นหาผู้ใช้"
                append-icon="mdi-magnify"
                outlined
                dense
                class="mb-4"
              ></v-text-field>

              <!-- Display selected users for testing -->
              <div>Selected User IDs: {{ selectedUsers }}</div>

              <v-row>
                <v-col
                  v-for="user in filteredUsers"
                  :key="user.userId"
                  cols="12"
                  sm="6"
                >
          
                  <v-checkbox
                    v-model="selectedUsers"
                    :value="user.userId"
                    :label="user.userName"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Action Buttons -->
        <v-divider class="my-4"></v-divider>
        <v-card-actions class="justify-end">
          <v-btn text @click="authorizeStore.createGroupDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="saveGroup">
            {{ isEditMode ? "บันทึกการเปลี่ยนแปลง" : "สร้างกลุ่ม" }}
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>

    <!-- Snackbar for showing messages -->
    <v-snackbar v-model="snackbar" timeout="3000" color="red" top>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useAuthorizeStore } from "@/stores/autorize.store";
import { useUserStore } from "@/stores/user.store";
import type Groups from "@/types/authentorize/group.type";

const authorizeStore = useAuthorizeStore();
const userStore = useUserStore();
const isEditMode = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");
const selectedPermissions = ref<number[]>([]);
const selectedUsers = ref<number[]>([]);
const searchQuery = ref("");

// Ensure data loads when the dialog opens
onMounted(async () => {
  await authorizeStore.getPermissions();
  await userStore.getAllUsers();
});

watch(
  () => authorizeStore.createGroupDialog,
  (isOpen) => {
    if (!isOpen) resetForm(); // Clear form when dialog is closed
  }
);

watch(
  () => authorizeStore.currentGroup,
  (newGroup) => {
    if (newGroup) {
      selectedPermissions.value = newGroup.permissions?.map((p) => p.id) || [];
      selectedUsers.value = newGroup.users
        ? newGroup.users.map((u) => u.userId)
        : [];
    }
  }
);

// Toggle selection of users
const toggleUserSelection = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index === -1) {
    selectedUsers.value.push(userId); // Add user ID if not selected
  } else {
    selectedUsers.value.splice(index, 1); // Remove user ID if already selected
  }
};

// Open the dialog with populated data for editing
const openEditDialog = (group: Groups) => {
  isEditMode.value = true;
  authorizeStore.currentGroup = { ...group };
  selectedPermissions.value = group.permissions?.map((p) => p.id) || [];
  selectedUsers.value = group.members
    ? group.members.map((u) => u.user.userId)
    : [];
  authorizeStore.createGroupDialog = true;
};

// Reset form data when dialog is closed or after saving
const resetForm = () => {
  authorizeStore.currentGroup = { name: "", permissionIds: [] };
  selectedPermissions.value = [];
  selectedUsers.value = [];
  isEditMode.value = false;
};

// Save the group data
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

  const groupData = {
    groupId: authorizeStore.currentGroup.groupId,
    name: authorizeStore.currentGroup.name,
    permissionIds: selectedPermissions.value,
    userIds: selectedUsers.value,
  };

  if (isEditMode.value && authorizeStore.currentGroup.groupId) {
    await authorizeStore.updateGroup(groupData);
    snackbarMessage.value = "บันทึกการเปลี่ยนแปลงสำเร็จ!";
  } else {
    await authorizeStore.createGroup(groupData);
    snackbarMessage.value = "สร้างกลุ่มสำเร็จ!";
  }

  snackbar.value = true;
  resetForm();
  authorizeStore.createGroupDialog = false;
  await authorizeStore.getGroups();
};

// Filter users based on search query
const filteredUsers = computed(() => {
  let filtered = userStore.users;

  if (searchQuery.value) {
    filtered = filtered.filter((user) =>
      user.userName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});
</script>

<style scoped>
.permission-checklist {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 16px;
}

.v-expansion-panel-header {
  font-weight: bold;
  color: #1976d2;
}

.v-btn {
  margin-right: 10px;
}

.v-card-actions {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
}
</style>
