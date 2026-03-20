import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            fileUrl?: string;
            fileUrls?: Array<{
                url: string;
                storageKey?: string;
            }>;
            fileMeta?: {
                url: string;
                storageKey?: string;
            } | null;
        }
    }
}
export declare const upload: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadMulti: (fieldName?: string, maxCount?: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.middleware.d.ts.map