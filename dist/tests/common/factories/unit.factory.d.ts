import { Factory } from "fishery";
export declare const unitFactory: Factory<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.UnitStatus;
    projectId: string;
    towerId: string | null;
    floor: number | null;
    unitNumber: string | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    facing: string | null;
    price: bigint | null;
}, any, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.UnitStatus;
    projectId: string;
    towerId: string | null;
    floor: number | null;
    unitNumber: string | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    facing: string | null;
    price: bigint | null;
}, import("fishery").DeepPartialObject<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.UnitStatus;
    projectId: string;
    towerId: string | null;
    floor: number | null;
    unitNumber: string | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    facing: string | null;
    price: bigint | null;
}>>;
//# sourceMappingURL=unit.factory.d.ts.map