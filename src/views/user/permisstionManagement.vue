<template>
  <v-container>
    <!-- Navigation Tabs for Categories -->
    <v-tabs v-model="selectedTab">
      <v-tab v-for="(role, index) in roles" :key="index">
        {{ role.name.toUpperCase() }}
      </v-tab>
    </v-tabs>

    <!-- Content Based on Selected Tab -->
    <v-tabs-items v-model="selectedTab">
      <v-tab-item v-for="(group, index) in groupedPermissions" :key="index">
        <v-card class="pa-4">
          <!-- Group Name as Header -->
          <v-card-title>{{ group.groupName }}</v-card-title>

          <v-divider class="my-4"></v-divider>

          <!-- Dynamically Loop Through Group Permissions with 2 Columns -->
          <v-row>
            <v-col
              cols="6"
              v-for="permission in group.permissions"
              :key="permission.id"
            >
              <!-- Checkbox for permission -->
              <v-checkbox
                v-model="permission.checked"
                :label="permission.name"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

    <!-- Action Buttons for Save and Cancel -->
    <v-row class="mt-4 justify-space-between">
      <v-btn color="red" @click="cancelChanges">Cancel</v-btn>
      <v-btn color="blue darken-1" @click="saveChanges">Save Changes</v-btn>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthorizeStore } from "@/stores/autorize.store";
import type { Permission } from "@/types/permisstion.type";
import type { Role } from "@/types/role.type";
import { ref, watch, onMounted } from "vue";

// Define the roles and grouped permissions
const roles = ref<Role[]>([]);
const groupedPermissions = ref<any[]>([]); // `any` because we need to handle grouped permissions structure
const selectedTab = ref(0);
const authorizeStore = useAuthorizeStore();

// Fetch roles and permissions from API and group permissions by group name
onMounted(async () => {
  await authorizeStore.getRoles();
  await authorizeStore.getPermissions();
  roles.value = authorizeStore.roles;

  // Initialize grouped permissions for the first role
  groupPermissionsForSelectedRole(selectedTab.value);
});

// Watch for changes in selected tab and update grouped permissions accordingly
watch(selectedTab, (newIndex) => {
  groupPermissionsForSelectedRole(newIndex);
});

// Group permissions by 'group' and set 'checked' for each permission
const groupPermissionsForSelectedRole = (roleIndex: number) => {
  if (!roles.value[roleIndex] || !roles.value[roleIndex].permissions) return;

  groupedPermissions.value = groupPermissionsByGroup(
    roles.value[roleIndex].permissions!
  );
};

// Helper function to group permissions by group name
const groupPermissionsByGroup = (permissions: Permission[]) => {
  const grouped: any = [];

  // Assuming `authorizeStore.allPermissions` contains all available permissions
  authorizeStore.permissions.forEach((permission: Permission) => {
    // Find or create the group
    let group = grouped.find((g: any) => g.groupName === permission.group);
    if (!group) {
      group = {
        groupName: permission.group,
        permissions: [],
      };
      grouped.push(group);
    }

    // Check if the current role has this permission
    const hasPermission = permissions.some((rolePermission) => rolePermission.id === permission.id);
    group.permissions.push({ ...permission, checked: hasPermission });
  });

  return grouped;
};

// Handle Save Changes (send updated permissions to API)
const saveChanges = () => {
  const updatedPermissions = groupedPermissions.value.flatMap((group) =>
    group.permissions.filter((permission: Permission) => permission.checked)
  );
  console.log("Updated Permissions:", updatedPermissions);
};

// Handle Cancel Changes
const cancelChanges = () => {
  groupPermissionsForSelectedRole(selectedTab.value);
};
</script>
