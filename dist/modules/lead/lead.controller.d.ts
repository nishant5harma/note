import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../types/auth-request.js";
export declare const LeadController: {
    listLeadsHandler: typeof listLeadsHandler;
    getLeadByIdHandler: typeof getLeadByIdHandler;
};
export default LeadController;
declare function listLeadsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
declare function getLeadByIdHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=lead.controller.d.ts.map