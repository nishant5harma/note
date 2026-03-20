// src/modules/inventory/listing/types/listing-filter.type.ts
export interface ListingFilter {
  page?: string | number | undefined;
  limit?: string | number | undefined;
  city?: string | undefined;
  locality?: string | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  sqftMin?: number | undefined;
  sqftMax?: number | undefined;
  projectId?: string | undefined;
  unitId?: string | undefined;
  status?: string | undefined;
  type?: string | undefined;
  q?: string | undefined;
  sort?:
    | "price_asc"
    | "price_desc"
    | "created_desc"
    | "created_asc"
    | undefined;
}
