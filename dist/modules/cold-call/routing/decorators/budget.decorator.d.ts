import { type RoutingContext, type RoutingDecorator, type DecoratorReturn } from "./base.decorator.js";
export declare class BudgetRoutingDecorator implements RoutingDecorator {
    kind: string;
    config: any;
    constructor(config?: any);
    private parseBudget;
    apply(ctx: RoutingContext): Promise<DecoratorReturn>;
}
export default BudgetRoutingDecorator;
//# sourceMappingURL=budget.decorator.d.ts.map