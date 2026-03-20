export interface ContinueToken {
    __continue: true;
}
export declare function CONTINUE(): ContinueToken;
export type DecoratorReturn = string | null | ContinueToken;
export interface RoutingContext {
    entry: any;
    batch: any;
    availableTeams: string[];
    assignedTeamId?: string | null;
    previousContinue?: boolean;
    meta?: Record<string, any>;
}
export interface RoutingDecorator {
    kind: string;
    config?: any;
    apply(ctx: RoutingContext): Promise<DecoratorReturn>;
}
//# sourceMappingURL=base.decorator.d.ts.map