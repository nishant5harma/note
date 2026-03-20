// /src/modules/cold-call/routing/routing-engine.ts
import {} from "./decorators/base.decorator.js";
import LocationRoutingDecorator from "./decorators/location.decorator.js";
import BudgetRoutingDecorator from "./decorators/budget.decorator.js";
import DefaultEvenSplitDecorator from "./decorators/default.decorator.js";
export function buildDecorators(config) {
    if (!config || typeof config !== "object")
        return [];
    const rules = Array.isArray(config.rules) ? config.rules : [];
    const out = [];
    for (const r of rules) {
        const cfg = r.config ?? {};
        switch (r.kind) {
            case "location":
                out.push(new LocationRoutingDecorator(cfg));
                break;
            case "budget":
                out.push(new BudgetRoutingDecorator(cfg));
                break;
            case "default":
                out.push(new DefaultEvenSplitDecorator(cfg));
                break;
        }
    }
    return out;
}
export async function runDecorators(ctx, decorators) {
    let prevContinue = false;
    let meta = ctx.meta ?? {};
    for (const dec of decorators) {
        const localCtx = {
            ...ctx,
            previousContinue: prevContinue,
            meta,
        };
        const result = await dec.apply(localCtx);
        // meta propagation
        if (localCtx.meta && Object.keys(localCtx.meta).length > 0) {
            meta = { ...meta, ...localCtx.meta };
        }
        // continue propagation
        if (result && typeof result === "object" && "__continue" in result) {
            prevContinue = true;
            continue;
        }
        if (typeof result === "string")
            return result;
    }
    return null;
}
//# sourceMappingURL=routing-engine.js.map