// /src/utils/param.util.ts
/** Normalize Express param/query value (string | string[]) to string. */
export function asString(value) {
    if (value === undefined)
        return "";
    return Array.isArray(value) ? value[0] ?? "" : value;
}
//# sourceMappingURL=param.util.js.map