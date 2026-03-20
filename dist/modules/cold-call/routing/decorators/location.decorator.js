// /src/modules/cold-call/routing/decorators/location.decorator.ts
import { CONTINUE, } from "./base.decorator.js";
export class LocationRoutingDecorator {
    kind = "location";
    config;
    constructor(config) {
        this.config = config ?? {};
    }
    async apply(ctx) {
        const entry = ctx.entry ?? {};
        const map = (this.config?.map ?? {});
        const possibleKeys = ["city", "location", "area", "region", "state"];
        let loc = null;
        for (const key of possibleKeys) {
            const v = entry.payload?.[key] ?? entry[key];
            if (v != null && String(v).trim() !== "") {
                loc = String(v).trim().toLowerCase();
                break;
            }
        }
        if (!loc)
            return null;
        // 1) direct match
        const raw = map[loc];
        if (raw !== undefined) {
            if (typeof raw === "string")
                return raw;
            if (raw && typeof raw === "object") {
                if (typeof raw.teamId === "string")
                    return raw.teamId;
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
                    if (typeof val === "string")
                        return val;
                    if (val && typeof val === "object") {
                        if (typeof val.teamId === "string")
                            return val.teamId;
                        if (val.continue) {
                            if (val.meta) {
                                ctx.meta = { ...(ctx.meta ?? {}), ...(val.meta ?? {}) };
                            }
                            return CONTINUE();
                        }
                    }
                }
            }
            catch {
                // ignore
            }
        }
        return null;
    }
}
export default LocationRoutingDecorator;
//# sourceMappingURL=location.decorator.js.map