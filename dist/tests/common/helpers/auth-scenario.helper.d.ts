export interface AuthContext {
    user: {
        id: string;
    };
    token: string;
}
export declare function createAuthContext(permissions?: string[]): Promise<AuthContext>;
//# sourceMappingURL=auth-scenario.helper.d.ts.map