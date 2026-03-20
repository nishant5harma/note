import { safeStr, pickFromFieldArray } from "./helpers.js";
/**
 * Google Ads lead webhook shape is vendor-specific (usually from server notification or partner).
 * This mapper attempts to extract common fields from nested structures.
 */
export function mapGoogleAdsLead(raw) {
    try {
        const provider = "google_ads_leads";
        // Many Google lead payloads include leadData or leadFormData or lead
        const payload = raw?.leadData ?? raw?.lead_form_response ?? raw;
        // fields might be array of { fieldName, fieldValue } or similar
        const fieldsArray = payload?.fields ?? payload?.fieldData ?? payload?.leadFormFields ?? null;
        let email = null;
        let phone = null;
        let name = null;
        if (Array.isArray(fieldsArray)) {
            email = pickFromFieldArray(fieldsArray, ["email", "email_address"]);
            phone = pickFromFieldArray(fieldsArray, [
                "phone",
                "mobile",
                "phone_number",
            ]);
            name = pickFromFieldArray(fieldsArray, ["name", "full_name"]);
        }
        else {
            email = safeStr(payload?.email ?? payload?.emailAddress ?? payload?.contact?.email);
            phone = safeStr(payload?.phone ?? payload?.contact?.phone ?? payload?.phoneNumber);
            name = safeStr(payload?.name ?? payload?.contact?.name);
        }
        const externalId = safeStr(payload?.leadId ?? payload?.externalId ?? payload?.id);
        return {
            provider,
            externalId,
            email,
            phone,
            name,
            payload: raw,
        };
    }
    catch (err) {
        return {
            provider: "google_ads_leads",
            externalId: null,
            email: null,
            phone: null,
            name: null,
            payload: raw,
        };
    }
}
//# sourceMappingURL=google-lead-ad.mapper.js.map