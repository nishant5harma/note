import { type RoutingDecorator, type RoutingContext } from "./decorators/base.decorator.js";
export declare function buildDecorators(config: any): RoutingDecorator[];
export declare function runDecorators(ctx: RoutingContext, decorators: RoutingDecorator[]): Promise<string | null>;
//# sourceMappingURL=routing-engine.d.ts.map