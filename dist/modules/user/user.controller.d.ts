import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../types/auth-request.js";
export declare const UserController: {
    createUserHandler: typeof createUserHandler;
    listUsersHandler: typeof listUsersHandler;
    findUserByIdHandler: typeof findUserByIdHandler;
};
export default UserController;
declare function createUserHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
declare function listUsersHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
declare function findUserByIdHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=user.controller.d.ts.map