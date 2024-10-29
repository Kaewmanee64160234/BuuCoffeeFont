<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import type Groups from "@/types/authentorize/group.type";
import { useUserStore } from "@/stores/user.store";
import { useAuthorizeStore } from "@/stores/autorize.store";
import CreateGroupPermisstionDialog from "@/components/authorize/CreateGroupPermisstionDialog.vue";
const authorizeStore = useAuthorizeStore();
const userStore = useUserStore();

const selectedGroup = ref<any>(null);
const editDialog = ref(false);
const selectedUser = ref<number | null>(null);

const openDialog = () => {
  authorizeStore.createGroupDialog = true;
};

// Load initial data on component mount
onMounted(async () => {
  await authorizeStore.getGroups();
  await authorizeStore.getPermissions();
  await userStore.getAllUsers(); // Ensure users are loaded for selection
});

// Edit a group
const editGroup = (group: Groups) => {
  selectedGroup.value = { ...group, permissions: group.permissions!.map((p) => p.id), users: group.users }; // Map permissions to IDs
  editDialog.value = true;
};

// Update group changes
const updateGroup = async () => {
  if (!selectedGroup.value.name || !selectedGroup.value.permissions.length) {
    Swal.fire("Error", "ต้องระบุชื่อกลุ่มและสิทธิ์", "error");
    return;
  }

  await authorizeStore.updateGroup({
    id: selectedGroup.value.id,
    name: selectedGroup.value.name,
    permissionIds: selectedGroup.value.permissions,
  });

  Swal.fire("Success", "บันทึกการเปลี่ยนแปลงสำเร็จ", "success");

  editDialog.value = false;
  await authorizeStore.getGroups(); // Refresh the groups list
};

// Delete a group
const deleteGroup = async (group: Groups) => {
  const result = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: `ต้องการลบกลุ่ม "${group.name}" ใช่หรือไม่?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ใช่, ลบเลย!",
  });

  if (result.isConfirmed) {
    await authorizeStore.deleteGroup(group.groupId!);
    Swal.fire("Deleted!", "กลุ่มถูกลบเรียบร้อย", "success");
    await authorizeStore.getGroups(); // Refresh the groups list
  }
};

// Close edit dialog
const closeEditDialog = () => {
  editDialog.value = false;
};

// Add user to group
const addUserToGroup = async (group: Groups, userId: number | null) => {
  if (userId === null) return;
  await authorizeStore.addUsersToGroup(group.id!, [userId]);
  selectedUser.value = null; // Reset selected user
  await authorizeStore.getGroups(); // Refresh the groups list
};

// Remove user from group
const removeUserFromGroup = async (group: Groups, user: any) => {
  await authorizeStore.removeUserFromGroup(group.id!, user.id);
  await authorizeStore.getGroups(); // Refresh the groups list
};
</script>
<template>
  <v-container>
    <!-- Create Group Button -->
    <v-row>
      <v-col cols="12" class="text-right mb-4">
        <v-btn color="primary" @click="openDialog()">สร้างกลุ่มผู้ใช้งาน</v-btn>
      </v-col>
    </v-row>

    <!-- Display each group as a card with details and add/remove user options -->
    <v-row>
      <v-col v-for="group in authorizeStore.groups" :key="group.id" cols="12" sm="6" md="4">
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
                :key="user.id"
                close
                @click:close="removeUserFromGroup(group, user)"
              >
                {{ user.name }}

              </v-chip>
            </v-chip-group>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="editGroup(group)">แก้ไข</v-btn>
            <v-btn color="red" @click="deleteGroup(group)">ลบ</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Group Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>แก้ไขกลุ่ม</v-card-title>
        <v-card-text>
          <v-text-field v-model="selectedGroup.name" label="ชื่อกลุ่ม" outlined></v-text-field>
          <v-textarea v-model="selectedGroup.description" label="คำอธิบาย" outlined></v-textarea>

          <!-- Permissions Selection -->
          <v-select
            v-model="selectedGroup.permissions"
            :items="authorizeStore.permissions"
            item-text="name"
            item-value="id"
            multiple
            label="เลือกสิทธิ์"
            outlined
          ></v-select>

          <!-- User Management -->
          <h5 class="text-subtitle-1 mt-4">เพิ่มผู้ใช้ในกลุ่ม</h5>
          <v-select
            v-model="selectedUser"
            :items="authorizeStore.users"
            item-text="name"
            item-value="id"
            label="เลือกผู้ใช้"
            outlined
          ></v-select>
          <v-btn @click="addUserToGroup(selectedGroup, selectedUser)" color="green" class="mt-2">เพิ่มผู้ใช้</v-btn>

          <!-- Current Users in the Group -->
          <v-chip-group column v-if="selectedGroup.users">
            <v-chip
              v-for="user in selectedGroup.users"
              :key="user.id"
              close
              @click:close="removeUserFromGroup(selectedGroup, user)"
            >
              {{ user.name }}
            </v-chip>
          </v-chip-group>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="updateGroup">บันทึกการเปลี่ยนแปลง</v-btn>
          <v-btn color="red" @click="closeEditDialog">ยกเลิก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <CreateGroupPermisstionDialog />
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
