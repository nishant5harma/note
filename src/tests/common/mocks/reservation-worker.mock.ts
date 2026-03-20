// tests/common/mocks/reservation-worker.mock.ts
import { jest } from "@jest/globals";

/* ------------------------------------------- */
/* Plain interface                             */
/* ------------------------------------------- */
interface ReservationWorkerMock {
  reservationExpirationQueue: {
    getJob: (jobId: string) => Promise<any>;
  };
  enqueueReservationExpiration: (reservationId: string) => Promise<void>;
}

/* ------------------------------------------- */
/* Explicitly typed object                     */
/* ------------------------------------------- */
export const reservationWorkerMock: ReservationWorkerMock = {
  reservationExpirationQueue: {
    getJob: jest.fn(async () => null),
  },
  enqueueReservationExpiration: jest.fn(async () => {}),
};

/* ------------------------------------------- */
/* Module mock                                 */
/* ------------------------------------------- */
jest.unstable_mockModule(
  "@/modules/inventory/reservation/worker/reservation.worker.js",
  () => ({
    __esModule: true,
    ...reservationWorkerMock,
  })
);
