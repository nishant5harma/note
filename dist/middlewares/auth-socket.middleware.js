// /src/middlewares/auth-socket.middleware.ts
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { UnauthorizedError } from "../utils/http-errors.util.js";
import { prisma } from "../db/db.js";
export async function authSocketMiddleware(socket, next) {
    try {
        const authHeader = socket.handshake?.headers?.authorization;
        const authToken = socket.handshake?.auth?.token ||
            (typeof authHeader === "string"
                ? authHeader.replace("Bearer ", "")
                : undefined);
        if (!authToken) {
            return next(new UnauthorizedError("Missing token"));
        }
        let payload;
        try {
            payload = verifyAccessToken(authToken);
        }
        catch (err) {
            return next(new UnauthorizedError("Invalid or expired token"));
        }
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            return next(new UnauthorizedError("User not found"));
        }
        const permissionSet = new Set();
        user.roles.forEach((userRole) => {
            userRole.role.permissions.forEach((rolePerm) => {
                if (rolePerm.permission?.key) {
                    permissionSet.add(rolePerm.permission.key);
                }
            });
        });
        socket.user = {
            id: user.id,
            roleIds: user.roles.map((r) => r.roleId),
        };
        socket.data.userId = user.id;
        socket.data.permissions = permissionSet;
        socket.permissions = permissionSet;
        next();
    }
    catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
}
//# sourceMappingURL=auth-socket.middleware.js.map