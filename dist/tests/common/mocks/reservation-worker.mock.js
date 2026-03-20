// tests/common/mocks/reservation-worker.mock.ts
import { jest } from "@jest/globals";
/* ------------------------------------------- */
/* Explicitly typed object                     */
/* ------------------------------------------- */
export const reservationWorkerMock = {
    reservationExpirationQueue: {
        getJob: jest.fn(async () => null),
    },
    enqueueReservationExpiration: jest.fn(async () => { }),
};
/* ------------------------------------------- */
/* Module mock                                 */
/* ------------------------------------------- */
jest.unstable_mockModule("@/modules/inventory/reservation/worker/reservation.worker.js", () => ({
    __esModule: true,
    ...reservationWorkerMock,
}));
//# sourceMappingURL=reservation-worker.mock.js.map