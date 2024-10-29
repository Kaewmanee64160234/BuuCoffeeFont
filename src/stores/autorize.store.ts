// stores/authorize.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import authorizeService from "@/service/authorize.service"; // Assuming this service handles API calls
import type { Permission } from "@/types/authentorize/permisstion.type";
import type { Role } from "@/types/authentorize/role.type";
import type Groups from "@/types/authentorize/group.type";
import type GroupMember from "@/types/authentorize/group-member.type";

export const useAuthorizeStore = defineStore("authorize", () => {
  const roles = ref<Role[]>([]);
  const currentRole = ref<Role | null>(null);
  const permissions = ref<Permission[]>([]);
  const createGroupDialog = ref<boolean>(false);
  const currentGroup = ref<Groups>({
    id: -1,
    name: "",
    permissions: [],
  });
  const currentPermission = ref<Permission | null>(null);
  const groups = ref<Groups[]>();

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

       
      } else {
        console.error("API response is not an array:", res.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
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
  // getGroups
  const getGroups = async () => {
    try {
      const res = await authorizeService.getGroups();
      groups.value = res.data;
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  // createGroup
  const createGroup = async (group: Groups) => {
    try {
      const res = await authorizeService.createGroup(group);
      if (res.status === 201) {
        currentGroup.value = res.data;
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }
  // updateGroup
  const updateGroup = async (group: Groups) => {
    try {
      const res = await authorizeService.updateGroup(group);
      if (res.status === 200) {
        currentGroup.value = res.data;
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  }
  // deleteGroup
  const deleteGroup = async (id: number) => {
    try {
      const res = await authorizeService.deleteGroup(id);
      if (res.status === 200) {
        currentGroup.value = res.data;
      }
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  }
  // addUserToGroup
  const addUsersToGroup = async (groupId: number, userIds: number[]) => {
    try {
      const res = await authorizeService.addUsersToGroup(groupId, userIds);
      if (res.status === 200) {
        currentGroup.value = res.data;
      }
    } catch (error) {
      console.error("Error adding users to group:", error);
    }
  }

  // removeUserFromGroup
  const removeUserFromGroup = async (group: Groups) => {
    try {
      const res = await authorizeService.removeUserFromGroup(group.id!);
      if (res.status === 200) {
        currentGroup.value = res.data;
      }
    } catch (error) {
      console.error("Error removing user from group:", error);
    }
  }

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
    updateRole,
    getGroups,
    currentGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    createGroupDialog,
    addUsersToGroup,
    removeUserFromGroup
  };
});
