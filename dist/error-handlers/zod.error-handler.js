import { z, ZodError } from "zod";
export function zodErrorHandler(err, req, res, next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: z.treeifyError(err),
        });
    }
    // Not a Zod error? Pass it to the next handler (the Global Error Handler)
    next(err);
}
//# sourceMappingURL=zod.error-handler.js.map