// tests/common/helpers/auth-scenario.helper.ts
import { userFactory } from "../factories/user.factory.js";
import { grantPermissions, generateAuthToken } from "./auth.helper.js";
/* ------------------------------------------------------------------ */
/* Helper                                                             */
/* ------------------------------------------------------------------ */
export async function createAuthContext(permissions = []) {
    const user = await userFactory.create();
    // Fishery guarantees ID after create()
    const userId = user.id;
    if (permissions.length) {
        await grantPermissions(userId, permissions);
    }
    return {
        user: { id: userId },
        token: generateAuthToken({ id: userId }),
    };
}
//# sourceMappingURL=auth-scenario.helper.js.map