import { Factory } from "fishery";
import type { RoleData } from "./role.factory.js";
interface UserData {
    id?: string;
    email: string;
    name: string;
    passwordHash: string;
    roles?: RoleData[];
}
export declare const userFactory: Factory<UserData, any, UserData, import("fishery").DeepPartialObject<UserData>>;
export {};
//# sourceMappingURL=user.factory.d.ts.map