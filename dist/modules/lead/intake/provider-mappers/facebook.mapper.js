import { safeStr, pickFromFieldArray } from "./helpers.js";
export function mapFacebookLead(raw) {
    // Facebook leadgen webhook structure varies. Try common shapes:
    // - root.entry[].changes[].value containing leadgen_id, form_id and field_data[]
    // - field_data is array of { name: "email", values: ["x"] } or { name: "full_name", value: "..." }
    try {
        const entry = Array.isArray(raw?.entry)
            ? raw.entry[0]
            : (raw?.entry ?? raw);
        const change = Array.isArray(entry?.changes)
            ? entry.changes[0]
            : (entry?.change ?? entry);
        const value = change?.value ?? entry?.value ?? raw;
        const externalId = safeStr(value?.leadgen_id ?? value?.id ?? value?.lead_id ?? value?.leadId);
        const provider = "facebook_leads";
        // field_data: pick standard fields
        const fieldArr = value?.field_data ?? value?.fields ?? value?.form_response?.answers;
        const email = pickFromFieldArray(fieldArr, [
            "email",
            "e-mail",
            "email_address",
        ]);
        const phone = pickFromFieldArray(fieldArr, [
            "phone_number",
            "phone",
            "mobile",
            "contact_number",
        ]);
        const name = pickFromFieldArray(fieldArr, ["full_name", "full name", "name"]) ??
            safeStr(value?.name) ??
            pickFromFieldArray(fieldArr, ["first_name", "first name"]);
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
            provider: "facebook_leads",
            externalId: null,
            email: null,
            phone: null,
            name: null,
            payload: raw,
        };
    }
}
//# sourceMappingURL=facebook.mapper.js.map