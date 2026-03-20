import { Factory } from "fishery";
export declare const unitFactory: Factory<{
    id: string;
    status: import("@prisma/client").$Enums.UnitStatus;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    projectId: string;
    facing: string | null;
    unitNumber: string | null;
    createdAt: Date;
    price: bigint | null;
    towerId: string | null;
    floor: number | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    updatedAt: Date;
}, any, {
    id: string;
    status: import("@prisma/client").$Enums.UnitStatus;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    projectId: string;
    facing: string | null;
    unitNumber: string | null;
    createdAt: Date;
    price: bigint | null;
    towerId: string | null;
    floor: number | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    updatedAt: Date;
}, import("fishery").DeepPartialObject<{
    id: string;
    status: import("@prisma/client").$Enums.UnitStatus;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    projectId: string;
    facing: string | null;
    unitNumber: string | null;
    createdAt: Date;
    price: bigint | null;
    towerId: string | null;
    floor: number | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    updatedAt: Date;
}>>;
//# sourceMappingURL=unit.factory.d.ts.map