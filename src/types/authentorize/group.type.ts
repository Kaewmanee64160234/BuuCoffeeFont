import type { Permission } from "./permisstion.type";

export default interface Groups {
    groupId?:number;
    name:string;
    permissions?:Permission[];
    permissionIds?:number[];
}