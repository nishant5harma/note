// src/modules/inventory/unit/types/unit-filter.type.ts
export interface UnitFilter {
  page?: number | undefined;
  limit?: number | undefined;
  projectId?: string | undefined;
  towerId?: string | undefined;
  status?: string | undefined;
  bedrooms?: number | undefined;
  bathrooms?: number | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  sizeMin?: number | undefined;
  sizeMax?: number | undefined;
  q?: string | undefined; // unitNumber or facing
  sort?:
    | "price_asc"
    | "price_desc"
    | "created_desc"
    | "created_asc"
    | undefined;
}
