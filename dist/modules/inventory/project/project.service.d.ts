export declare function createProject(data: any): Promise<{
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
}>;
export declare function listProjects(): Promise<{
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
}[]>;
export declare function updateProject(id: string, data: any): Promise<{
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
}>;
export declare function deleteProject(id: string): Promise<{
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
}>;
//# sourceMappingURL=project.service.d.ts.map