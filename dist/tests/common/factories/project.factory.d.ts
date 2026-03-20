import { Factory } from "fishery";
export declare const projectFactory: Factory<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    active: boolean;
    developer: string | null;
    city: string | null;
    locality: string | null;
    address: string | null;
}, any, {
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    active: boolean;
    developer: string | null;
    city: string | null;
    locality: string | null;
    address: string | null;
}, import("fishery").DeepPartialObject<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    active: boolean;
    developer: string | null;
    city: string | null;
    locality: string | null;
    address: string | null;
}>>;
//# sourceMappingURL=project.factory.d.ts.map