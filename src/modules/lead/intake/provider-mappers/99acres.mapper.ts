// src/modules/lead/provider-mappers/99acres.mapper.ts

import type { ProviderMappedInput } from "../types/type.js";

// STUB
export function map99acres(raw: any): ProviderMappedInput {
  // TODO: implement when we have an example payload from 99acres.
  // For now return a consistent normalized shape.
  return {
    provider: "99acres",
    externalId: raw?.id ?? raw?.leadId ?? null,
    email: raw?.email ?? null,
    phone: raw?.phone ?? null,
    name: raw?.name ?? null,
    payload: raw,
  };
}
