import { type DecoratorReturn, type RoutingContext, type RoutingDecorator } from "./base.decorator.js";
export declare class LocationRoutingDecorator implements RoutingDecorator {
    kind: string;
    config: any;
    constructor(config?: any);
    apply(ctx: RoutingContext): Promise<DecoratorReturn>;
}
export default LocationRoutingDecorator;
//# sourceMappingURL=location.decorator.d.ts.map