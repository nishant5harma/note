import { Factory } from "fishery";
export declare const projectFactory: Factory<{
    id: string;
    name: string;
    developer: string | null;
    city: string | null;
    locality: string | null;
    address: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}, any, {
    id: string;
    name: string;
    developer: string | null;
    city: string | null;
    locality: string | null;
    address: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}, import("fishery").DeepPartialObject<{
    id: string;
    name: string;
    developer: string | null;
    city: string | null;
    locality: string | null;
    address: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}>>;
//# sourceMappingURL=project.factory.d.ts.map