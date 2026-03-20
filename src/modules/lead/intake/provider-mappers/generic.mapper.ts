// src/modules/lead/provider-mappers/generic.mapper.ts
import type { ProviderMappedInput } from "../types/type.js";
import { safeStr, findByKeyCaseInsensitive } from "./helpers.js";

/**
 * Generic: best-effort extraction for custom HTML forms or third-party posting.
 * Looks for common keys at top-level and in nested 'data', 'form', 'payload' objects.
 */
export function mapGenericForm(
  raw: any,
  providerName = "generic_form"
): ProviderMappedInput {
  try {
    const provider = providerName;
    const top = raw ?? {};
    const candidates = [
      top,
      top.data,
      top.form,
      top.payload,
      top.body,
      top.form_response,
    ];

    let email = null;
    let phone = null;
    let name = null;
    let externalId = null;

    for (const c of candidates) {
      if (!c || typeof c !== "object") continue;
      if (!email)
        email = safeStr(
          findByKeyCaseInsensitive(c, [
            "email",
            "emailAddress",
            "email_address",
            "e-mail",
          ])
        );
      if (!phone)
        phone = safeStr(
          findByKeyCaseInsensitive(c, [
            "phone",
            "mobile",
            "phone_number",
            "contact",
          ])
        );
      if (!name)
        name = safeStr(
          findByKeyCaseInsensitive(c, [
            "name",
            "fullName",
            "full_name",
            "first_name",
          ])
        );
      if (!externalId)
        externalId = safeStr(
          findByKeyCaseInsensitive(c, [
            "id",
            "externalId",
            "external_id",
            "submissionId",
          ])
        );
    }

    return {
      provider,
      externalId,
      email,
      phone,
      name,
      payload: raw,
    };
  } catch {
    return {
      provider: providerName,
      externalId: null,
      email: null,
      phone: null,
      name: null,
      payload: raw,
    };
  }
}
