import type { Role } from "@/types/authentorize/role.type";
import http from "./axios";
import type { Permission } from "@/types/authentorize/permisstion.type";
import type Groups from "@/types/authentorize/group.type";
import type GroupMember from "@/types/authentorize/group-member.type";
// create roles
function createRole(role: Role) {
  return http.post("/roles/create", role);
}
// get roles
function getRoles() {
  return http.get("/roles");
}
// get role by id
function getRoleById(id: number) {
  return http.get(`/roles/${id}`);
}
// Assign permissions to an existing role

function assignPermissionsToRole(roleId: number) {
  return http.post(`/roles/${roleId}/permissions`);
}

// create permisstion
function createPermission(permission: Permission) {
  return http.post("/permissions/create", permission);
}
// get permisstions
function getPermissions() {
  return http.get("/permissions");
}
// get permisstion by id
function getPermissionById(id: number) {
  return http.get(`/permissions/${id}`);
}

// update   @Patch('/:roleId/permissions')
 function updateRole(role:Role) {
  return http.patch(`/roles/${role.id}/permissions`, role);
 }
//  getGroups
const getGroups = async () => {
 return http.get("/groups");
}
// craeteGroup
const createGroup = async (group: Groups) => {
  const groupData = {
    name: group.name,
    permissionIds: group.permissionIds,
    userIds: group.userIds
  }
  console.log("groupData", groupData);
  
 return http.post("/groups", groupData);
}

// updateGroup
const updateGroup = async (group: Groups) => {
  return http.patch(`/groups/${group.groupId}`, group);
}

// deleteGroup
const deleteGroup = async (id: number) => {
  return http.delete(`/groups/${id}`);
}

// addUserToGroup
const addUsersToGroup = async (groupId: number, userIds: number[]) => {
  return http.patch(`/groups/${groupId}/users`, { userIds });
}
// removeUserFromGroup
const removeUserFromGroup = async (groupMemberId: number) => {
  return http.delete(`/group-members/${groupMemberId}`);
}


export default {
  createRole,
  getRoles,
  getRoleById,
  assignPermissionsToRole,
  createPermission,
  getPermissions,
  getPermissionById,
  updateRole,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addUsersToGroup,
  removeUserFromGroup
};
