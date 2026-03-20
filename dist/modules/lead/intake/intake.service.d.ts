/**
 * Main intake handler:
 * - parse raw body (JSON or empty)
 * - normalize provider from headers or body
 * - compute dedupeHash
 * - use a Redis guard to avoid concurrent intake for same dedupe/externalId
 * - persist webhook event (audit)
 * - link to existing lead if found
 * - otherwise create lead and initial assignment row inside a transaction
 */
export declare function handleWebhook(rawBodyString: string, headersIn: any): Promise<{
    ok: boolean;
    note: string;
    eventId: string;
    leadId?: undefined;
    webhookEventId?: undefined;
} | {
    ok: boolean;
    leadId: string;
    webhookEventId: string;
    note: string;
    eventId?: undefined;
}>;
//# sourceMappingURL=intake.service.d.ts.map