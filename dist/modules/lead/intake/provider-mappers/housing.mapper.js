// src/modules/lead/provider-mappers/housing.mapper.ts
// STUB
export function mapHousing(raw) {
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
//# sourceMappingURL=housing.mapper.js.map