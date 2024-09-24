import type { Permission } from "./permisstion.type";

export interface Role  {
    name: string;
    permissions?: Permission[];

}