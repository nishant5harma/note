// /src/utils/omit-undefined.util.ts
export function omitUndefined<T extends Record<string, any>>(
  obj: T
): {
  [K in keyof T as undefined extends T[K] ? never : K]: Exclude<
    T[K],
    undefined
  >;
} {
  const result: any = {};
  for (const key in obj) {
    const val = obj[key];
    if (val !== undefined) result[key] = val;
  }
  return result;
}
