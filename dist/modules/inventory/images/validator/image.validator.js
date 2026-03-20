// /src/modules/inventory/images/validator.image.ts
import { z } from "zod";
export const reorderSchema = z.object({
    order: z.array(z.string()).min(1),
});
//# sourceMappingURL=image.validator.js.map