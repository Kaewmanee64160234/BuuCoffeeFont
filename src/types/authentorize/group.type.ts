// groups.type.ts
import type GroupMember from "./group-member.type";
import type { Permission } from "./permisstion.type";
import type { User } from "./user.type";

export default interface Groups {
  groupId?: number;
  name: string;
  permissions?: Permission[]; // Loaded permissions
  permissionIds?: number[];   // Permission IDs for referencing
  userIds?: number[];          // User IDs for referencing
  members?: GroupMember[];     // Group members
  users?: User[];              // Users directly associated
}
