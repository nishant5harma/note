import { type RoutingDecorator, type RoutingContext } from "./base.decorator.js";
export declare class DefaultEvenSplitDecorator implements RoutingDecorator {
    kind: string;
    config: any;
    constructor(config?: any);
    apply(ctx: RoutingContext): Promise<string | null>;
}
export default DefaultEvenSplitDecorator;
//# sourceMappingURL=default.decorator.d.ts.map