<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/user.store';
import type { Permission } from '@/types/permisstion.type';
import { useAuthorizeStore } from '@/stores/autorize.store';

const userStore = useUserStore();
const authorizeStore = useAuthorizeStore();

const selectedRoleName = ref<string | null>(null);
const isSaved = ref(false);

const permissions = ref<Permission[]>([]); // Assume permissions are provided from the store or API

// Groups with empty permission arrays initially
const groups = ref<{ name: string; id: string; permissions: Permission[] }[]>([
  { name: 'การขาย', id: 'sales', permissions: [] },
  { name: 'สินค้า', id: 'products', permissions: [] },
  { name: 'ผู้ใช้', id: 'users', permissions: [] },
  { name: 'วัตถุดิบ', id: 'materials', permissions: [] },
  { name: 'รายงาน', id: 'reports', permissions: [] },
]);

// Function to group permissions based on their group attribute
const groupPermissions = () => {
  if (Array.isArray(permissions.value)) {
    groups.value.forEach((group) => (group.permissions = []));
    permissions.value.forEach((permission) => {
      const group = groups.value.find((g) => g.name === permission.group);
      if (group) {
        group.permissions.push(permission);
      }
    });
    console.log('Grouped permissions:', groups.value);
  } else {
    console.error('permissions is not an array:', permissions.value);
  }
};

// Watch `userStore.detailUserDialog` to initialize permissions when the dialog is opened
watch(
  () => userStore.detailUserDialog,
  (isOpen) => {
    if (isOpen) {
      // Fetch permissions based on the current user when the dialog opens
      permissions.value = userStore.user?.role.permissions || [];
      groupPermissions();
    }
  }
);

// Actions for managing permissions
const checkAllPermissions = () => {
  groups.value.forEach((group) =>
    group.permissions.forEach((permission) => {
      permission.checked = true;
    })
  );
};

const clearAllPermissions = () => {
  groups.value.forEach((group) =>
    group.permissions.forEach((permission) => {
      permission.checked = false;
    })
  );
};

const handlePermissionChange = (permission: Permission) => {
  isSaved.value = false;
};

const saveChanges = () => {
  // Logic to save changes
  isSaved.value = true;
};

const cancelChanges = () => {
  // Logic to cancel changes
  isSaved.value = false;
};

// Close the dialog
const closeDialog = () => {
  userStore.detailUserDialog = false;
  userStore.user = null;
  permissions.value = [];

};
</script>

<template>
  <v-dialog v-model="userStore.detailUserDialog" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">รายละเอียดผู้ใช้งาน</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <p><strong>ชื่อผู้ใช้:</strong> {{ userStore.user?.userName }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>อีเมลผู้ใช้:</strong> {{ userStore.user?.userEmail }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>สถานะผู้ใช้:</strong> {{ userStore.user?.userStatus }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>ตำแหน่งผู้ใช้:</strong> {{ userStore.user?.userRole }}</p>
            </v-col>
          </v-row>

          <!-- Display grouped permissions -->
          <v-row v-if="groups.length > 0">
            <v-col v-for="(group, index) in groups" :key="group.id" cols="12">
              <!-- <v-card class="pa-4 mb-4"> -->
                <!-- Group Name as Header -->
                <v-card-title>{{ group.name }}</v-card-title>
                <v-divider class="my-4"></v-divider>

                <!-- Loop Through Group Permissions with 2 Columns -->
                <v-row>
                  <v-col
                    cols="6"
                    v-for="permission in group.permissions"
                    :key="permission.id"
                  >
                    <v-chip
                    
                    >{{ permission.name }}</v-chip>
                    <!-- <p class="permission-description">{{ permission.description }}</p> -->
                  </v-col>
                </v-row>
              <!-- </v-card> -->
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
       
        <v-btn color="red" @click="closeDialog">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.action-buttons {
  margin: 16px 0;
}
.permission-description {
  font-size: 0.875rem;
  color: grey;
}
</style>
