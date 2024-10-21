import type { Role } from "./role.type";

export interface User {
   userId: number;
   userName: string;
   userPassword: string;
   userRole: string;
   userEmail: string;
   userStatus: string;
   role:Role;
}

export function mapToUser(data: any): User {
   return {
     userId: data.userId,
     userName: data.userName,
     userPassword: data.userPassword,
     userRole: data.userRole,
     userEmail: data.userEmail,
     userStatus: data.userStatus,
     role: data.role ? {
       roleId: data.role.roleId,
       roleName: data.role.roleName
     } : null, // ตรวจสอบว่ามีข้อมูล role หรือไม่
   };
 }