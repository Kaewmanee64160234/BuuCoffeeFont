// stores/authorize.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import authorizeService from "@/service/authorize.service"; // Assuming this service handles API calls
import type { Permission } from "@/types/permisstion.type";
import type { Role } from "@/types/role.type";

export const useAuthorizeStore = defineStore("authorize", () => {
  const roles = ref<Role[]>([]);
  const currentRole = ref<Role | null>(null);
  const permissions = ref<Permission[]>([]);
  const currentPermission = ref<Permission | null>(null);
  const groups = ref<{ name: string; id: string; permissions: Permission[] }[]>(
    [
      { name: "การขาย", id: "sales", permissions: [] }, // Sales group
      { name: "สินค้า", id: "products", permissions: [] }, // Products group
      { name: "ผู้ใช้", id: "users", permissions: [] }, // Users group
      { name: "วัตถุดิบ", id: "materials", permissions: [] }, // Materials group
      { name: "รายงาน", id: "reports", permissions: [] }, // Reports group
    ]
  );

  const createRole = async (role: Role) => {
    try {
      const res = await authorizeService.createRole(role);
      if (res.status === 201) {
        currentRole.value = res.data;
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const getRoles = async () => {
    try {
      const res = await authorizeService.getRoles();
      roles.value = res.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // update all roles
  const updateRole = async (role: Role) => {
    try {
      
        console.log("Role to update:", role);
        
      const res = await authorizeService.updateRole(role);
      if (res.status === 200) {
        console.log("Role updated successfully:", res.data);
        
      }
      await getRoles();
      await getPermissions();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const getPermissions = async () => {
    try {
      const res = await authorizeService.getPermissions();

      // Check if res.data is an array, otherwise throw an error
      if (Array.isArray(res.data)) {
        permissions.value = res.data;

        groupPermissions(); // Group the permissions after fetching them
      } else {
        console.error("API response is not an array:", res.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const groupPermissions = () => {
    // Ensure permissions.value is an array before iterating
    if (Array.isArray(permissions.value)) {
      // Reset each group's permissions before reassigning them
      groups.value.forEach((group) => (group.permissions = []));

      permissions.value.forEach((permission) => {
        // Find the group in the groups array that matches the permission's group property
        const group = groups.value.find(
          (group) => group.name === permission.group
        );

        if (group) {
          group.permissions.push(permission);
        }
      });
      console.log("Grouped permissions:", groups.value);
      
    } else {
      console.error("permissions is not an array:", permissions.value);
    }
  };
  const getRoleById = async (id: number) => {
    try {
      const res = await authorizeService.getRoleById(id);
      currentRole.value = res.data;
    } catch (error) {
      console.error("Error fetching role by ID:", error);
    }
  };

  const assignPermissionsToRole = async (roleId: number) => {
    try {
      const res = await authorizeService.assignPermissionsToRole(roleId);
      currentRole.value = res.data;
    } catch (error) {
      console.error("Error assigning permissions:", error);
    }
  };

  return {
    roles,
    permissions,
    groups,
    currentRole,
    currentPermission,
    createRole,
    getRoles,
    getRoleById,
    assignPermissionsToRole,
    getPermissions,
    groupPermissions,
    updateRole
  };
});
