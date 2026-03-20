import type { AuthUser } from "../../../types/auth-request.js";
import type { AttendanceListFilter, CheckinInput } from "./types/attendance.types.js";
export declare const AttendanceService: {
    createCheckin: typeof createCheckin;
    listAttendance: typeof listAttendance;
    checkout: typeof checkout;
};
export default AttendanceService;
declare function createCheckin(actor: AuthUser, payload: CheckinInput): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    updatedAt: Date;
    teamId: string | null;
    status: import("@prisma/client").$Enums.AttendanceStatus;
    note: string | null;
    photoRef: string | null;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    locationTs: Date | null;
    checkinAt: Date;
    checkoutAt: Date | null;
}>;
declare function listAttendance(filter: AttendanceListFilter): Promise<{
    count: number;
    rows: ({
        user: {
            teamMembers: ({
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
                userId: string;
                role: import("@prisma/client").$Enums.TeamMemberRole;
                teamId: string;
                joinedAt: Date;
                meta: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            phone: string | null;
            passwordHash: string;
            isActive: boolean;
            updatedAt: Date;
            version: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        teamId: string | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        note: string | null;
        photoRef: string | null;
        latitude: number | null;
        longitude: number | null;
        accuracy: number | null;
        locationTs: Date | null;
        checkinAt: Date;
        checkoutAt: Date | null;
    })[];
}>;
declare function checkout(actor: AuthUser): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    updatedAt: Date;
    teamId: string | null;
    status: import("@prisma/client").$Enums.AttendanceStatus;
    note: string | null;
    photoRef: string | null;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    locationTs: Date | null;
    checkinAt: Date;
    checkoutAt: Date | null;
}>;
//# sourceMappingURL=attendance.service.d.ts.map