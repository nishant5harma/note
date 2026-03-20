import type { ProviderMappedInput } from "../types/type.js";
/**
 * Typical Google Forms webhook (Apps Script / Form Response) can send:
 * - formResponse: { responseId, answers: [ ... ] } OR
 * - direct object with named fields
 */
export declare function mapGoogleForms(raw: any): ProviderMappedInput;
//# sourceMappingURL=google-forms.mapper.d.ts.map