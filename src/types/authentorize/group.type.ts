import type GroupMember from "./group-member.type";
import type { Permission } from "./permisstion.type";
import type { User } from "./user.type";

export default interface Groups {
    groupId?:number;
    name:string;
    permissions?:Permission[];
    permissionIds?:number[];
    userIds?:number[];
    members?:GroupMember[];
    users?:User[];
}