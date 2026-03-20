import type { ProviderMappedInput } from "../types/type.js";
/**
 * Generic: best-effort extraction for custom HTML forms or third-party posting.
 * Looks for common keys at top-level and in nested 'data', 'form', 'payload' objects.
 */
export declare function mapGenericForm(raw: any, providerName?: string): ProviderMappedInput;
//# sourceMappingURL=generic.mapper.d.ts.map