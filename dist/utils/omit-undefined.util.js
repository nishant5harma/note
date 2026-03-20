// /src/utils/omit-undefined.util.ts
export function omitUndefined(obj) {
    const result = {};
    for (const key in obj) {
        const val = obj[key];
        if (val !== undefined)
            result[key] = val;
    }
    return result;
}
//# sourceMappingURL=omit-undefined.util.js.map