import type { Role } from "@/types/role.type";
import http from "./axios";
import type { Permission } from "@/types/permisstion.type";
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

export default {
  createRole,
  getRoles,
  getRoleById,
  assignPermissionsToRole,
  createPermission,
  getPermissions,
  getPermissionById,
  updateRole
};
