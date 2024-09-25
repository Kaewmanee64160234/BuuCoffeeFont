
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

  // Assuming `authorizeStore.permissions` contains all available permissions
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
    const hasPermission = permissions.some(
      (rolePermission) => rolePermission.id === permission.id
    );
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

// Check all permissions
const checkAllPermissions = () => {
  groupedPermissions.value.forEach((group) => {
    group.permissions.forEach((permission: Permission) => {
      permission.checked = true;
    });
  });
};

// Clear all permissions
const clearAllPermissions = () => {
  groupedPermissions.value.forEach((group) => {
    group.permissions.forEach((permission: Permission) => {
      permission.checked = false;
    });
  });
};
</script>

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
      <div class="action-buttons">
        <v-btn small color="green" @click="checkAllPermissions"
          >Check All</v-btn
        >
        <v-btn small color="orange" @click="clearAllPermissions"
          >Clear All</v-btn
        >
      </div>
      <v-tab-item v-for="(group, index) in groupedPermissions" :key="index">
        <v-card class="pa-4">
          <!-- Group Name as Header -->
          <v-card-title>
            {{ group.groupName }}
            <!-- Buttons for Check All and Clear All at the top right -->
          </v-card-title>

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

              <!-- Description below the checkbox -->
              <p class="permission-description">{{ permission.description }}</p>
            </v-col>
          </v-row>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>



<style scoped>
.permission-description {
  margin-top: -8px;
  font-size: 0.875rem;
  color: gray;
}

.action-buttons {
margin: 5px;
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>