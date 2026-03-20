// /src/modules/inventory/tower/validator/tower.validator.ts
import { z } from "zod";
export const createTowerSchema = z.object({
    projectId: z.string().min(1),
    name: z.string().max(200).optional(),
    floors: z.number().int().nonnegative().optional(),
    meta: z.any().optional(),
});
export const updateTowerSchema = createTowerSchema.partial();
//# sourceMappingURL=tower.validator.js.map