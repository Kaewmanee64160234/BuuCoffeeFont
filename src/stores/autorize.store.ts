import authorizeService from "@/service/authorize.service";
import type { Permission } from "@/types/permisstion.type";
import type { Role } from "@/types/role.type";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthorize = defineStore("authorize", () => {
  const roles = ref<Role[]>([]);
  const currentRole = ref<Role>();
  const permissions = ref<Permission[]>([]);
  const currentPermission = ref<Permission>();

  const createRole = async (role: Role) => {
    try {
      const res = await authorizeService.createRole(role);
      if (res.status === 201) {
        currentRole.value = res.data;
      }
    } catch (error) {
      console.log(error);
    }
  };
//   getAll
    const getRoles = async () => {
        try {
        const res = await authorizeService.getRoles();
        roles.value = res.data;
        } catch (error) {
        console.log(error);
        }
    };
    const getRoleById = async (id: number) => {
        try {
        const res = await authorizeService.getRoleById(id);
        currentRole.value = res.data;
        } catch (error) {
        console.log(error);
        }
    };
    const assignPermissionsToRole = async (roleId: number, permissionId: number) => {
        try {
        const res = await authorizeService.assignPermissionsToRole(roleId, permissionId);
        currentRole.value = res.data;
        } catch (error) {
        console.log(error);
        }
    };
    const createPermission = async (permission: Permission) => {
        try {
        const res = await authorizeService.createPermission(permission);
        if (res.status === 201) {
            currentPermission.value = res.data;
        }
        } catch (error) {
        console.log(error);
        }
    };
    const getPermissions = async () => {
        try {
        const res = await authorizeService.getPermissions();
        permissions.value = res.data;
        } catch (error) {
        console.log(error);
        }
    };
    const getPermissionById = async (id: number) => {
        try {
        const res = await authorizeService.getPermissionById(id);
        currentPermission.value = res.data;
        } catch (error) {
        console.log(error);
        }
    };


  return {
    roles,
    permissions,
    currentRole,
    currentPermission,
    createRole,
    getRoles,
    getRoleById,
    assignPermissionsToRole,
    createPermission,
    getPermissions,
    getPermissionById,
    
  };
});
