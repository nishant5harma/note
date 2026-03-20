// src/modules/hr/location/types/location.types.ts
export type RespondLocationInput = {
  latitude: number;
  longitude: number;
  accuracy?: number | undefined;
  recordedAt?: string | undefined;
};
