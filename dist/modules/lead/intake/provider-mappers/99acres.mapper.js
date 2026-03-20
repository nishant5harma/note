// src/modules/lead/provider-mappers/99acres.mapper.ts
// STUB
export function map99acres(raw) {
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
//# sourceMappingURL=99acres.mapper.js.map