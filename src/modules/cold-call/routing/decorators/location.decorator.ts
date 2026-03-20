// /src/modules/cold-call/routing/decorators/location.decorator.ts

import {
  CONTINUE,
  type DecoratorReturn,
  type RoutingContext,
  type RoutingDecorator,
} from "./base.decorator.js";

export class LocationRoutingDecorator implements RoutingDecorator {
  kind = "location";
  config: any;

  constructor(config?: any) {
    this.config = config ?? {};
  }

  async apply(ctx: RoutingContext): Promise<DecoratorReturn> {
    const entry = ctx.entry ?? {};
    const map = (this.config?.map ?? {}) as Record<string, any>;

    const possibleKeys = ["city", "location", "area", "region", "state"];
    let loc: string | null = null;

    for (const key of possibleKeys) {
      const v = entry.payload?.[key] ?? entry[key];
      if (v != null && String(v).trim() !== "") {
        loc = String(v).trim().toLowerCase();
        break;
      }
    }

    if (!loc) return null;

    // 1) direct match
    const raw = map[loc];
    if (raw !== undefined) {
      if (typeof raw === "string") return raw;

      if (raw && typeof raw === "object") {
        if (typeof raw.teamId === "string") return raw.teamId;

        if (raw.continue) {
          if (raw.meta) {
            ctx.meta = { ...(ctx.meta ?? {}), ...(raw.meta ?? {}) };
          }
          return CONTINUE();
        }
      }
    }

    // 2) fuzzy matching
    for (const mk of Object.keys(map)) {
      try {
        if (loc.includes(mk.toLowerCase())) {
          const val = map[mk];

          if (typeof val === "string") return val;

          if (val && typeof val === "object") {
            if (typeof val.teamId === "string") return val.teamId;

            if (val.continue) {
              if (val.meta) {
                ctx.meta = { ...(ctx.meta ?? {}), ...(val.meta ?? {}) };
              }
              return CONTINUE();
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return null;
  }
}

export default LocationRoutingDecorator;
