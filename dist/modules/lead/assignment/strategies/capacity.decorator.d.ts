export declare class CapacityDecorator {
    base: any;
    redis: import("ioredis").default;
    constructor(baseStrategy: any);
    pickCandidate(ctx: {
        lead: any;
        assignment: any;
    }): Promise<any>;
}
//# sourceMappingURL=capacity.decorator.d.ts.map