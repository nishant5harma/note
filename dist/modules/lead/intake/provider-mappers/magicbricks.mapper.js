// src/modules/lead/provider-mappers/magicbricks.mapper.ts
// STUB
export function mapMagicBricks(raw) {
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
//# sourceMappingURL=magicbricks.mapper.js.map