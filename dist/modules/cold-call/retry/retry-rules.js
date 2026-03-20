// src/modules/cold-call/retry/retry-rules.ts
export const RETRY_RULES = {
    MAX_ATTEMPTS: 3,
    DELAYS: {
        no_answer: 10 * 60 * 1000,
        busy: 5 * 60 * 1000,
        wrong_number: 0,
        not_interested: 0,
        interested: 0,
        callback: 2 * 60 * 60 * 1000,
        other: 30 * 60 * 1000,
    },
};
//# sourceMappingURL=retry-rules.js.map