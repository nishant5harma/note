import { Factory } from "fishery";
import { ConsentType } from "@prisma/client";
export interface ConsentData {
    id?: string;
    userId: string;
    type: ConsentType;
    version?: string | null;
    meta?: any;
    grantedAt?: Date;
    revokedAt?: Date | null;
}
export declare const consentFactory: Factory<ConsentData, any, ConsentData, import("fishery").DeepPartialObject<ConsentData>>;
//# sourceMappingURL=consent.factory.d.ts.map