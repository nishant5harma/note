export declare function createTower(data: any): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    floors: number | null;
    projectId: string;
}>;
export declare function getTower(id: string): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    floors: number | null;
    projectId: string;
}>;
export declare function listTowersByProject(projectId?: string): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    floors: number | null;
    projectId: string;
}[]>;
export declare function updateTower(id: string, data: any): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    floors: number | null;
    projectId: string;
}>;
export declare function deleteTower(id: string): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    floors: number | null;
    projectId: string;
}>;
//# sourceMappingURL=tower.service.d.ts.map