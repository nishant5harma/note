// /src/modules/inventory/reservation/helper-services/ttl-job.service.ts
import { prisma } from "@/db/db.js";

export async function saveTTLJob(reservationId: string, jobId: string) {
  return prisma.reservationTTLJob.upsert({
    where: { reservationId },
    create: { reservationId, jobId },
    update: { jobId },
  });
}

export async function getTTLJob(reservationId: string) {
  return prisma.reservationTTLJob.findUnique({
    where: { reservationId },
  });
}

export async function deleteTTLJob(reservationId: string) {
  return prisma.reservationTTLJob
    .delete({
      where: { reservationId },
    })
    .catch(() => null); // safe delete
}
