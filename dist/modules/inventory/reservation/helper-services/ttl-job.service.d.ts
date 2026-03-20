export declare function saveTTLJob(reservationId: string, jobId: string): Promise<{
    id: string;
    expiresAt: Date | null;
    createdAt: Date;
    jobId: string;
    reservationId: string;
}>;
export declare function getTTLJob(reservationId: string): Promise<{
    id: string;
    expiresAt: Date | null;
    createdAt: Date;
    jobId: string;
    reservationId: string;
} | null>;
export declare function deleteTTLJob(reservationId: string): Promise<{
    id: string;
    expiresAt: Date | null;
    createdAt: Date;
    jobId: string;
    reservationId: string;
} | null>;
//# sourceMappingURL=ttl-job.service.d.ts.map