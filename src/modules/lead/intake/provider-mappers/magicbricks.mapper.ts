// src/modules/lead/provider-mappers/magicbricks.mapper.ts

import type { ProviderMappedInput } from "../types/type.js";

// STUB

export function mapMagicBricks(raw: any): ProviderMappedInput {
  // TODO: fill mapping after collecting sample payloads.
  return {
    provider: "magicbricks",
    externalId: raw?.id ?? raw?.leadId ?? null,
    email: raw?.email ?? null,
    phone: raw?.phone ?? null,
    name: raw?.name ?? null,
    payload: raw,
  };
}
