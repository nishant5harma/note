// tests/common/helpers/auth-scenario.helper.ts
import { userFactory } from "../factories/user.factory.js";
import { grantPermissions, generateAuthToken } from "./auth.helper.js";

/* ------------------------------------------------------------------ */
/* Public return type                                                  */
/* ------------------------------------------------------------------ */
export interface AuthContext {
  user: { id: string };
  token: string;
}

/* ------------------------------------------------------------------ */
/* Helper                                                             */
/* ------------------------------------------------------------------ */
export async function createAuthContext(
  permissions: string[] = []
): Promise<AuthContext> {
  const user = await userFactory.create();

  // Fishery guarantees ID after create()
  const userId = user.id as string;

  if (permissions.length) {
    await grantPermissions(userId, permissions);
  }

  return {
    user: { id: userId },
    token: generateAuthToken({ id: userId }),
  };
}
