// src/modules/lead/provider-mappers/google-forms.mapper.ts
import type { ProviderMappedInput } from "../types/type.js";
import {
  safeStr,
  findByKeyCaseInsensitive,
  pickFromFieldArray,
} from "./helpers.js";

/**
 * Typical Google Forms webhook (Apps Script / Form Response) can send:
 * - formResponse: { responseId, answers: [ ... ] } OR
 * - direct object with named fields
 */
export function mapGoogleForms(raw: any): ProviderMappedInput {
  try {
    const provider = "google_forms";
    // try common shapes
    const formResponse = raw?.formResponse ?? raw;
    // Google AppScript often posts an object where answers are keyed by question title
    // Another common shape: { responseId, answers: [ { question, answer } ] }
    const answersArray =
      formResponse?.answers ??
      formResponse?.response?.answers ??
      (Array.isArray(formResponse?.formResponse?.answers)
        ? formResponse.formResponse.answers
        : undefined);

    // If answersArray exists, search for email/phone/name
    let email = null;
    let phone = null;
    let name = null;
    if (Array.isArray(answersArray)) {
      email = pickFromFieldArray(answersArray, [
        "email",
        "email address",
        "e-mail",
      ]);
      phone = pickFromFieldArray(answersArray, [
        "phone",
        "mobile",
        "contact number",
      ]);
      name = pickFromFieldArray(answersArray, ["name", "full name"]);
    } else {
      // fallback: look for common top-level keys
      email = safeStr(
        findByKeyCaseInsensitive(formResponse, [
          "email",
          "emailAddress",
          "email_address",
        ])
      );
      phone = safeStr(
        findByKeyCaseInsensitive(formResponse, [
          "phone",
          "mobile",
          "phoneNumber",
          "phone_number",
        ])
      );
      name = safeStr(
        findByKeyCaseInsensitive(formResponse, [
          "name",
          "fullName",
          "full_name",
        ])
      );
    }

    // external id: try responseId or id
    const externalId = safeStr(
      formResponse?.responseId ??
        formResponse?.id ??
        formResponse?.response?.responseId
    );

    return {
      provider,
      externalId,
      email,
      phone,
      name,
      payload: raw,
    };
  } catch (err) {
    return {
      provider: "google_forms",
      externalId: null,
      email: null,
      phone: null,
      name: null,
      payload: raw,
    };
  }
}
