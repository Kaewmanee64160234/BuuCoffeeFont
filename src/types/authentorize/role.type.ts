import type { Permission } from "./permisstion.type";

export interface Role  {
    id:number;
    name: string;
    permissions: Permission[];

}