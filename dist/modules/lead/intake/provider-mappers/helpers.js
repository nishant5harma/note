// src/modules/lead/provider-mappers/helpers.ts
export function safeStr(v) {
    if (v == null)
        return null;
    if (typeof v === "string")
        return v.trim() === "" ? null : v.trim();
    if (typeof v === "number")
        return String(v);
    try {
        return JSON.stringify(v);
    }
    catch {
        return String(v);
    }
}
export function findByKeyCaseInsensitive(obj, keys) {
    if (!obj || typeof obj !== "object")
        return undefined;
    const lowerMap = {};
    for (const k of Object.keys(obj))
        lowerMap[k.toLowerCase()] = k;
    for (const key of keys) {
        const lk = key.toLowerCase();
        if (lowerMap[lk])
            return obj[lowerMap[lk]];
    }
    return undefined;
}
export function pickFromFieldArray(fieldArray, possibleNames) {
    if (!Array.isArray(fieldArray))
        return null;
    for (const f of fieldArray) {
        if (!f || typeof f !== "object")
            continue;
        // Normalize name/key/title into one lowercase string for matching
        const rawName = f.name ?? f.field ?? f.key ?? f.title ?? f.label ?? f.question ?? "";
        const name = String(rawName).toLowerCase();
        for (const pn of possibleNames) {
            const pnLower = pn.toLowerCase();
            if (name === pnLower || name.includes(pnLower)) {
                // Common Facebook shapes
                if (f.values && Array.isArray(f.values) && f.values.length)
                    return safeStr(f.values[0]);
                if (f.value !== undefined)
                    return safeStr(f.value);
                if (f.values_string)
                    return safeStr(f.values_string);
                // As a last resort, pick the first key other than 'name' (if any)
                const keys = Object.keys(f);
                if (keys.length > 0) {
                    // prefer a key that isn't 'name' (to avoid returning the name field itself)
                    const candidateKey = keys.find((k) => k.toLowerCase() !== "name") ?? keys[0];
                    // guard again to ensure candidateKey exists before indexing
                    if (candidateKey && f[candidateKey] !== undefined)
                        return safeStr(f[candidateKey]);
                }
                // nothing matched in this field object
                return null;
            }
        }
    }
    return null;
}
//# sourceMappingURL=helpers.js.map