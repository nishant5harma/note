interface ReservationWorkerMock {
    reservationExpirationQueue: {
        getJob: (jobId: string) => Promise<any>;
    };
    enqueueReservationExpiration: (reservationId: string) => Promise<void>;
}
export declare const reservationWorkerMock: ReservationWorkerMock;
export {};
//# sourceMappingURL=reservation-worker.mock.d.ts.map