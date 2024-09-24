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