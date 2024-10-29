import type { Permission } from "./permisstion.type";

export default interface Groups {
    id?:number;
    name:string;
    permissions?:Permission[];
    permissionIds?:number[];
}