// /src/modules/inventory/project/validator/project.validator.ts
import { z } from "zod";
export const createProjectSchema = z.object({
    name: z.string().min(1),
    developer: z.string().optional(),
    city: z.string().optional(),
    locality: z.string().optional(),
    address: z.string().optional(),
    meta: z.any().optional(),
});
export const updateProjectSchema = createProjectSchema.partial();
//# sourceMappingURL=project.validator.js.map