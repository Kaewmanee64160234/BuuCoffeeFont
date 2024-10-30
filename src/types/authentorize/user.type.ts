// user.type.ts
import type GroupMember from "./group-member.type";
import type { Role } from "./role.type";

export interface User {
  userId: number;
  userName: string;
  userPassword: string;
  userRole: string;
  userEmail: string;
  userStatus: string;
  role: Role | null;
  groupMemberships: GroupMember[];
}

export function mapToUser(data: any): User {
  return {
    userId: data.userId,
    userName: data.userName,
    userPassword: data.userPassword,
    userRole: data.userRole,
    userEmail: data.userEmail,
    userStatus: data.userStatus,
    role: data.role
      ? {
          permissions: data.role.permissions || [],
          id: data.role.id,
          name: data.role.name,
        }
      : null, // Ensuring a valid role object if data is present
    groupMemberships: data.groupMemberships
      ? data.groupMemberships.map((groupMember: any) => ({
          groupMemberId: groupMember.groupMemberId,
          group: groupMember.group,
          user: groupMember.user,
        }))
      : [],
  };
}
