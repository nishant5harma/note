/**
 * Record a consent entry (user grants consent)
 */
export declare function createConsent(params: {
    userId: string;
    type: "LOCATION" | "PHOTO" | "TERMS";
    version?: string | null;
    meta?: any;
}): Promise<{
    id: string;
    userId: string;
    version: string | null;
    type: import("@prisma/client").$Enums.ConsentType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    grantedAt: Date;
    revokedAt: Date | null;
}>;
/**
 * Revoke consent (set revokedAt)
 */
export declare function revokeConsent(params: {
    userId: string;
    id?: string;
    type?: "LOCATION" | "PHOTO" | "TERMS";
}): Promise<{
    id: string;
    userId: string;
    version: string | null;
    type: import("@prisma/client").$Enums.ConsentType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    grantedAt: Date;
    revokedAt: Date | null;
}>;
/**
 * List consents for a user
 */
export declare function listConsents(userId: string): Promise<{
    id: string;
    userId: string;
    version: string | null;
    type: import("@prisma/client").$Enums.ConsentType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    grantedAt: Date;
    revokedAt: Date | null;
}[]>;
//# sourceMappingURL=consent.service.d.ts.map