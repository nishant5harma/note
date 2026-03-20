// /src/modules/cold-call/routing/decorators/default.decorator.ts

import {
  type RoutingDecorator,
  type RoutingContext,
} from "./base.decorator.js";

export class DefaultEvenSplitDecorator implements RoutingDecorator {
  kind = "default";
  config: any;

  constructor(config?: any) {
    this.config = config ?? {};
  }

  async apply(ctx: RoutingContext): Promise<string | null> {
    // RR handled in service, decorator chain just says “no decision”
    return null;
  }
}

export default DefaultEvenSplitDecorator;
