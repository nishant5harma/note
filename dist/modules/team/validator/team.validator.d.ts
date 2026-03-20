import { z } from "zod";
export declare const createTeamSchema: z.ZodObject<{
    name: z.ZodString;
    leadId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateTeamSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    leadId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const assignLeadSchema: z.ZodObject<{
    leadId: z.ZodString;
}, z.core.$strip>;
export declare const assignMembersSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    userIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    role: z.ZodOptional<z.ZodEnum<{
        MEMBER: "MEMBER";
        ASSISTANT_LEAD: "ASSISTANT_LEAD";
        LEAD: "LEAD";
    }>>;
}, z.core.$strip>;
export declare const removeMemberSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const bulkRemoveSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
    reason: z.ZodString;
}, z.core.$strip>;
export declare const transferRequestSchema: z.ZodObject<{
    toTeamId: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const joinRequestSchema: z.ZodObject<{
    targetUserId: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const respondRequestSchema: z.ZodObject<{
    approve: z.ZodBoolean;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=team.validator.d.ts.map