export declare function saveTTLJob(reservationId: string, jobId: string): Promise<{
    id: string;
    expiresAt: Date | null;
    createdAt: Date;
    reservationId: string;
    jobId: string;
}>;
export declare function getTTLJob(reservationId: string): Promise<{
    id: string;
    expiresAt: Date | null;
    createdAt: Date;
    reservationId: string;
    jobId: string;
}>;
export declare function deleteTTLJob(reservationId: string): Promise<any>;
//# sourceMappingURL=ttl-job.service.d.ts.map