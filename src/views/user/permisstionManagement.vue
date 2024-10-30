<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import type Groups from "@/types/authentorize/group.type";
import { useUserStore } from "@/stores/user.store";
import { useAuthorizeStore } from "@/stores/autorize.store";
import CreateGroupPermisstionDialog from "@/components/authorize/CreateGroupPermisstionDialog.vue";
import type { User } from "@/types/authentorize/user.type";

const authorizeStore = useAuthorizeStore();
const userStore = useUserStore();

const selectedGroup = ref<Groups | null>(null);
const editDialog = ref(false);
const selectedUser = ref<number | null>(null);

const openCreateDialog = () => {
  selectedGroup.value = null;
  authorizeStore.editMode = false;
  authorizeStore.createGroupDialog = true;
};

const openEditDialog = (group: Groups) => {
  selectedGroup.value = group;
  authorizeStore.currentGroup = group;
  authorizeStore.editMode = true;
  authorizeStore.createGroupDialog = true;
};

// Load initial data on component mount
onMounted(async () => {
  await authorizeStore.getGroups();
  await authorizeStore.getPermissions();
  await userStore.getAllUsers();
});

// deleteGroup
const deleteGroup = async (group: Groups) => {
  const result = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "คุณต้องการลบกลุ่มผู้ใช้งานนี้หรือไม่?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบกลุ่มนี้!",
    cancelButtonText: "ยกเลิก",
  });

  if (result.isConfirmed) {
    await authorizeStore.deleteGroup(group.groupId!);
  }
};

// removeUserFromGroup
const removeUserFromGroup = async (group: Groups, user: User) => {
  const result = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: `คุณต้องการลบผู้ใช้งาน ${user.userName} ออกจากกลุ่ม ${group.name} หรือไม่?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบผู้ใช้งานนี้!",
    cancelButtonText: "ยกเลิก",
  });

  if (result.isConfirmed) {
    await authorizeStore.removeUserFromGroup(group.groupId!, user.userId);
    authorizeStore.currentGroup = {
      name: "",
      permissionIds: [],
      userIds: [],
      groupId: -1,
      permissions: [],
      users: [],
    };
  }
};
</script>

<template>
  <v-container>
    <!-- Create Group Button -->
    <v-row>
      <v-col cols="12" class="text-right mb-4">
        <v-btn color="primary" @click="openCreateDialog">สร้างกลุ่มผู้ใช้งาน</v-btn>
      </v-col>
    </v-row>

    <!-- Display each group as a card with details and add/remove user options -->
    <v-row>
      <v-col v-for="group in authorizeStore.groups" :key="group.groupId" cols="12" sm="6" md="4">
        <v-card class="group-card mb-4">
          <v-card-title>{{ group.name }}</v-card-title>
          <v-card-subtitle>{{ group.description || 'ไม่มีคำอธิบาย' }}</v-card-subtitle>
          <v-card-text>
            <h5 class="text-subtitle-1">สิทธิ์ในการใช้งาน:</h5>
            <ul>
              <li v-for="permission in group.permissions" :key="permission.id">
                {{ permission.name }}
              </li>
            </ul>
            <h5 class="text-subtitle-1 mt-4">ผู้ใช้ในกลุ่ม:</h5>
            <v-chip-group column v-if="group.users">
              <v-chip
                v-for="user in group.users"
                :key="user.userId"
                close
                @click:close="removeUserFromGroup(group, user)"
              >
                {{ user.userName }}
              </v-chip>
            </v-chip-group>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="openEditDialog(group)">แก้ไข</v-btn>
            <v-btn color="red" @click="deleteGroup(group)">ลบ</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Group Permission Dialog Component -->
    <CreateGroupPermisstionDialog 
      :groupData="selectedGroup" 
      :isEditMode="authorizeStore.editMode" 
      @close="authorizeStore.createGroupDialog = false"
    />
  </v-container>
</template>

<style scoped>
.text-right {
  text-align: right;
}
.group-card {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
