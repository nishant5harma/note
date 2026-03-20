import type { Response } from "express";
export declare const AuthService: {
    login: typeof login;
    refresh: typeof refresh;
    logout: typeof logout;
    getCurrentUser: typeof getCurrentUser;
};
export default AuthService;
declare function login(email: string, password: string, res: Response): Promise<{
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        roles: {
            id: string;
            name: string;
        }[];
    };
}>;
declare function refresh(refreshToken: string | undefined, res: Response): Promise<{
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        roles: {
            id: string;
            name: string;
        }[];
    };
}>;
declare function logout(refreshToken: string | undefined, res: Response): Promise<{
    ok: boolean;
}>;
declare function getCurrentUser(userId: string): Promise<{
    user: {
        id: string;
        name: string;
        email: string;
        roles: {
            id: string;
            name: string;
        }[];
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map