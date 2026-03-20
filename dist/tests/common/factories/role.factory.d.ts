import { Factory } from "fishery";
import type { PermissionData } from "./permission.factory.js";
export interface RoleData {
    id?: string;
    name: string;
    permissions?: PermissionData[];
}
export declare const roleFactory: Factory<RoleData, any, RoleData, import("fishery").DeepPartialObject<RoleData>>;
//# sourceMappingURL=role.factory.d.ts.map