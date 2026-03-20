// src/modules/lead/provider-mappers/housing.mapper.ts

import type { ProviderMappedInput } from "../types/type.js";

// STUB
export function mapHousing(raw: any): ProviderMappedInput {
  // TODO: fill mapping after collecting sample payloads.
  return {
    provider: "housing",
    externalId: raw?.id ?? raw?.leadId ?? null,
    email: raw?.email ?? null,
    phone: raw?.phone ?? null,
    name: raw?.name ?? null,
    payload: raw,
  };
}
