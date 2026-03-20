/**
 * Generates a valid JWT for testing purposes.
 * @param user The user object created by a factory (must have an id)
 * @returns A signed JWT string
 */
export declare function generateAuthToken(user: {
    id: string;
}): string;
/**
 * Helper to setup RBAC for integration tests.
 */
export declare function grantPermissions(userId: string, permissionKeys: string[]): Promise<void>;
//# sourceMappingURL=auth.helper.d.ts.map