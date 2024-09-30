<template>
  <v-container>
    <!-- Dropdown for Role Selection -->
    <v-select
      v-model="selectedRoleName"
      :items="authorizeStore.roles"
      item-title="name"
      label="User"
    >
      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props" :subtitle="item.name"></v-list-item>
      </template>
    </v-select>

    <!-- Action buttons for Check All and Clear All -->
    <div class="action-buttons">
      <v-btn small color="green" @click="checkAllPermissions" :disabled="!selectedRoleName">Check All</v-btn>
      <v-btn small color="orange" @click="clearAllPermissions" :disabled="!selectedRoleName">Clear All</v-btn>
    </div>

    <!-- Display permissions if a role is selected -->
    <v-row v-if="groupedPermissions.length > 0">
      <v-col v-for="(group, index) in groupedPermissions" :key="index" cols="12">
        <v-card class="pa-4">
          <!-- Group Name as Header -->
          <v-card-title>{{ group.groupName }}</v-card-title>
          <v-divider class="my-4"></v-divider>

          <!-- Loop Through Group Permissions with 2 Columns -->
          <v-row>
            <v-col
              cols="6"
              v-for="permission in group.permissions"
              :key="permission.id"
            >
              <!-- Checkbox for permission with @change event, disabled if no role selected or if changes have been saved -->
              <v-checkbox
                v-model="permission.checked"
                :label="permission.name"
                @change="handlePermissionChange(permission)"
                :disabled="!selectedRoleName || isSaved"
              ></v-checkbox>

              <!-- Description below the checkbox -->
              <p class="permission-description">{{ permission.description }}</p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Button save and cancel -->
    <div class="action-buttons">
      <v-btn small color="primary" @click="saveChanges" :disabled="!selectedRoleName || isSaved">Save Changes</v-btn>
      <v-btn small color="red" @click="cancelChanges" :disabled="!selectedRoleName">Cancel Changes</v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthorizeStore } from "@/stores/autorize.store";
import type { Permission } from "@/types/permisstion.type";
import type { Role } from "@/types/role.type";
import { ref, watch, onMounted } from "vue";
import Swal from "sweetalert2";

// Define the authorizeStore.roles and grouped permissions
const groupedPermissions = ref<any[]>([]); // Temporary store for permissions of the selected role
const selectedRoleName = ref(""); // Track the currently selected role
const selectedRole = ref<Role>(); // Track the currently selected role
const authorizeStore = useAuthorizeStore();
const isSaved = ref(false); // Track if changes have been saved

// Fetch roles and permissions from API and group permissions by group name
onMounted(async () => {
  await authorizeStore.getRoles();
  await authorizeStore.getPermissions();

  // Initialize permissions for the first role if roles are loaded
  if (authorizeStore.roles.length > 0) {
    selectedRole.value = authorizeStore.roles[0]; // Select the first role by default
    groupPermissionsForSelectedRole(selectedRole.value);
  }
});

// Watch for changes in selected role and update grouped permissions accordingly
watch(selectedRoleName, (newRole) => {
  isSaved.value = false; // Reset the save status when the role changes
  console.log(`Selected Role Changed:`, newRole);
  const currentRoleIndex = authorizeStore.roles.findIndex((role: Role) => role.name === newRole);
  if (currentRoleIndex === -1) {
    console.warn(`Role not found in authorizeStore`);
    return;
  } else {
    selectedRole.value = authorizeStore.roles[currentRoleIndex];
    groupPermissionsForSelectedRole(authorizeStore.roles[currentRoleIndex]); // Update permissions when role changes
  }
});

// Group permissions by 'group' and set 'checked' for each permission
const groupPermissionsForSelectedRole = (role: Role) => {
  console.log(`Grouping permissions for role ${role.name}`);

  if (!role || !role.permissions) {
    console.warn(`Role or permissions not found`);
    return;
  }

  // Group the permissions by group name and set checked state
  groupedPermissions.value = groupPermissionsByGroup(role.permissions);
};

// Helper function to group permissions by group name
const groupPermissionsByGroup = (permissions: Permission[]) => {
  const grouped: any = [];

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

// Handle Save Changes (send updated permissions to store)
const saveChanges = async () => {
  if (!selectedRoleName.value) return;

  // Gather updated permissions from groupedPermissions
  const updatedPermissions = groupedPermissions.value.flatMap((group) =>
    group.permissions.filter((permission: Permission) => permission.checked)
  );

  // Update the selected role's permissions
  selectedRole!.value!.permissions = updatedPermissions;

  // Update the roles in authorizeStore
  authorizeStore.roles = authorizeStore.roles.map((role) =>
    role.id === selectedRole.value?.id ? { ...role, permissions: updatedPermissions } : role
  );

  console.log(`Updated Permissions for Role ${selectedRole.value!.name}:`, updatedPermissions);
  await authorizeStore.updateRole(selectedRole.value!);
  
  // Set isSaved to true to disable checkboxes after saving
  isSaved.value = true;

  // Show success message
  Swal.fire({
    title: 'สำเร็จ!',
    text: `Updated Permissions for Role ${selectedRole.value!.name}`,
    icon: 'success',
    confirmButtonText: 'ตกลง'
  });
};

// Handle Cancel Changes (reset permissions to initial state for the selected role)
const cancelChanges = () => {
  if (selectedRole.value) {
    groupPermissionsForSelectedRole(selectedRole.value); // Reset permissions for the selected role
    isSaved.value = false; // Allow changes after cancel
  }
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

// Handle permission change when checkbox is clicked
const handlePermissionChange = (permission: Permission) => {
  const currentRole = selectedRole.value;
  if (!currentRole) return;

  // Add or remove the permission from the current role's permission array
  if (permission.checked) {
    // Add the permission if checked
    if (!currentRole.permissions.some((p) => p.id === permission.id)) {
      currentRole.permissions.push(permission);
    }
  } else {
    // Remove the permission if unchecked
    currentRole.permissions = currentRole.permissions.filter(
      (p) => p.id !== permission.id
    );
  }

  console.log("Updated Role Permissions", currentRole.permissions);
};
</script>
