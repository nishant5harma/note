// src/modules/lead/provider-mappers/types.ts
export type ProviderMappedInput = {
  provider: string;
  externalId?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  payload?: any;
};
