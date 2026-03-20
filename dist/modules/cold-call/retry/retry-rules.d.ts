export declare const RETRY_RULES: {
    readonly MAX_ATTEMPTS: 3;
    readonly DELAYS: {
        readonly no_answer: number;
        readonly busy: number;
        readonly wrong_number: 0;
        readonly not_interested: 0;
        readonly interested: 0;
        readonly callback: number;
        readonly other: number;
    };
};
export type AttemptResult = keyof typeof RETRY_RULES.DELAYS;
//# sourceMappingURL=retry-rules.d.ts.map