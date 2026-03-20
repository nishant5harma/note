// src/tests/common/factories/reservation.factory.ts
import { Factory } from "fishery";
import { prisma } from "@/db/db.js";
import { type Reservation } from "@prisma/client";

export const reservationFactory = Factory.define<Reservation>(
  ({ onCreate }) => {
    onCreate((reservation) =>
      prisma.reservation.create({ data: reservation as any })
    );

    return {
      id: "res-id",
      unitId: "", // Must be provided or linked
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 3600000), // Default 1 hour from now
      meta: {},
      createdAt: new Date(),
    } as Reservation;
  }
);
