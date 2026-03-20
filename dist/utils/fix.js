export function toStringSafe(value) {
    if (value == null)
        return "";
    if (Array.isArray(value))
        return value[0] ?? "";
    return value;
}
//# sourceMappingURL=fix.js.map