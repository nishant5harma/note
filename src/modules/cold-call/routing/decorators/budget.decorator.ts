// /src/modules/cold-call/routing/decorators/budget.decorator.ts

import {
  CONTINUE,
  type RoutingContext,
  type RoutingDecorator,
  type DecoratorReturn,
} from "./base.decorator.js";

export class BudgetRoutingDecorator implements RoutingDecorator {
  kind = "budget";
  config: any;

  constructor(config?: any) {
    this.config = config ?? {};
  }

  private parseBudget(entry: any): number | null {
    const keys = [
      "budget",
      "price",
      "value",
      "expected_budget",
      "property_value",
      "amount",
    ];
    for (const k of keys) {
      const v = entry.payload?.[k] ?? entry[k];
      if (v != null) {
        const s = String(v).replace(/[^\d.-]/g, "");
        if (s === "") continue;
        const n = Number(s);
        if (!isNaN(n)) return n;
      }
    }
    return null;
  }

  async apply(ctx: RoutingContext): Promise<DecoratorReturn> {
    const ranges = Array.isArray(this.config?.ranges) ? this.config.ranges : [];
    if (!ranges.length) return null;

    const budget = this.parseBudget(ctx.entry);

    for (const r of ranges) {
      const cfg = r as Record<string, any>;

      // rule depends on previous decorator signaling continue
      if (cfg.requirePrevious && !ctx.previousContinue) continue;

      const hasMin = typeof cfg.min === "number";
      const hasMax = typeof cfg.max === "number";

      // unconditional range
      if (!hasMin && !hasMax) {
        if (typeof cfg.teamId === "string") return cfg.teamId;

        if (cfg.continue) {
          if (cfg.meta) ctx.meta = { ...(ctx.meta ?? {}), ...(cfg.meta ?? {}) };
          return CONTINUE();
        }

        continue;
      }

      // numeric check cannot work without a budget value
      if (budget == null) continue;

      const minOk = hasMin ? budget >= cfg.min : true;
      const maxOk = hasMax ? budget <= cfg.max : true;

      if (minOk && maxOk) {
        if (typeof cfg.teamId === "string") return cfg.teamId;

        if (cfg.continue) {
          if (cfg.meta) ctx.meta = { ...(ctx.meta ?? {}), ...(cfg.meta ?? {}) };
          return CONTINUE();
        }
      }
    }

    return null;
  }
}

export default BudgetRoutingDecorator;
