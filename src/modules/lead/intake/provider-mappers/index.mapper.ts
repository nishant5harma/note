// src/modules/lead/provider-mappers/index.ts
import type { ProviderMappedInput } from "../types/type.js";
import { mapFacebookLead } from "./facebook.mapper.js";
import { mapGoogleForms } from "./google-forms.mapper.js";
import { mapGoogleAdsLead } from "./google-lead-ad.mapper.js";
import { mapGenericForm } from "./generic.mapper.js";
import { map99acres } from "./99acres.mapper.js";
import { mapMagicBricks } from "./magicbricks.mapper.js";
import { mapHousing } from "./housing.mapper.js";

export function applyProviderMapper(
  provider: string,
  raw: any
): ProviderMappedInput | null {
  const p = (provider ?? "").toLowerCase();
  if (p.includes("facebook")) return mapFacebookLead(raw);
  if (
    p.includes("google_ads") ||
    p.includes("google_ads_leads") ||
    p.includes("googlead")
  )
    return mapGoogleAdsLead(raw);
  if (p.includes("google") || p.includes("google_forms") || p.includes("forms"))
    return mapGoogleForms(raw);
  if (p.includes("99acres")) return map99acres(raw);
  if (p.includes("magic") || p.includes("magicbricks"))
    return mapMagicBricks(raw);
  if (p.includes("housing")) return mapHousing(raw);
  // fallback generic
  if (p.includes("generic") || p.includes("form") || p === "")
    return mapGenericForm(raw, provider ?? "generic_form");
  return null;
}
