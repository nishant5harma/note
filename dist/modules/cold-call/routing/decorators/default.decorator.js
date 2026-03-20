// /src/modules/cold-call/routing/decorators/default.decorator.ts
export class DefaultEvenSplitDecorator {
    kind = "default";
    config;
    constructor(config) {
        this.config = config ?? {};
    }
    async apply(ctx) {
        // RR handled in service, decorator chain just says “no decision”
        return null;
    }
}
export default DefaultEvenSplitDecorator;
//# sourceMappingURL=default.decorator.js.map