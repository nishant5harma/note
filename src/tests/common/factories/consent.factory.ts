// src/tests/common/factories/consent.factory.ts
import { Factory } from "fishery";
import { prisma } from "@/db/db.js";
import { ConsentType } from "@prisma/client";

export interface ConsentData {
  id?: string;
  userId: string;
  type: ConsentType;
  version?: string | null; // Match Prisma nullable type
  meta?: any;
  grantedAt?: Date;
  revokedAt?: Date | null;
}

export const consentFactory = Factory.define<ConsentData>(({ onCreate }) => {
  onCreate(async (consent) => {
    return prisma.consent.create({
      data: {
        ...consent,
        meta: consent.meta ?? {},
      } as any,
    }) as any; // Cast to any to bypass complex Prisma/Fishery return type mismatches
  });

  return {
    userId: "placeholder-id", // Required by interface
    type: ConsentType.LOCATION,
    version: "v1.0.0",
    meta: {},
    grantedAt: new Date(),
    revokedAt: null,
  };
});
