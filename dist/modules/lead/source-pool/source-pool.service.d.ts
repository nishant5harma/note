export declare function listSourcePools(opts: {
    active?: boolean;
}): Promise<({
    team: {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        teamLeadId: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    source: string;
    strategy: string | null;
    active: boolean;
})[]>;
export declare function upsertSourcePool(input: {
    source: string;
    teamId?: string | null;
    strategy?: string | null;
    active?: boolean;
    meta?: any;
}): Promise<{
    team: {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        teamLeadId: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    source: string;
    strategy: string | null;
    active: boolean;
}>;
export declare function updateSourcePoolBySource(source: string, patch: {
    teamId?: string | null;
    strategy?: string | null;
    active?: boolean;
    meta?: any;
}): Promise<{
    team: {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        teamLeadId: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    source: string;
    strategy: string | null;
    active: boolean;
}>;
export declare function deleteSourcePoolBySource(source: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    source: string;
    strategy: string | null;
    active: boolean;
}>;
/**
 * Returns distinct lead sources that are present in DB but missing an active SourcePool mapping
 * OR mapped but teamId is null.
 */
export declare function listUnmappedLeadSources(): Promise<string[]>;
//# sourceMappingURL=source-pool.service.d.ts.map