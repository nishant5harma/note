export declare function omitUndefined<T extends Record<string, any>>(obj: T): {
    [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>;
};
//# sourceMappingURL=omit-undefined.util.d.ts.map