import { z } from "zod";
import { asString } from "../../utils/param.util.js";
import { UserService } from "./user.service.js";
import { createUserSchema } from "../../modules/user/validators/user.validator.js";
import { BadRequestError, UnauthorizedError, } from "../../utils/http-errors.util.js";
// /src/modules/user/user.controller.ts
// Exported UserController object
export const UserController = {
    createUserHandler,
    listUsersHandler,
    findUserByIdHandler,
    // add more handlers as needed
};
export default UserController;
// Controller Function Implementations
async function createUserHandler(req, res, next) {
    try {
        const data = createUserSchema.parse(req.body);
        const currentUser = req.user; // middleware sets authenticated user object
        if (!currentUser) {
            throw new UnauthorizedError("Authenticated user not found");
        }
        const result = await UserService.createUser(data, currentUser);
        return res.status(201).json(result);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: z.treeifyError(err) });
        }
        next(err);
    }
}
async function listUsersHandler(req, res, next) {
    try {
        const currentUser = req.user; // middleware sets authenticated user object
        if (!currentUser)
            throw new UnauthorizedError("Authenticated user not found");
        const result = await UserService.listUsers(currentUser);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
}
async function findUserByIdHandler(req, res, next) {
    try {
        const id = asString(req.params.id);
        if (!id)
            throw new BadRequestError("User ID is required");
        const currentUser = req.user; // middleware sets authenticated user object
        if (!currentUser)
            throw new UnauthorizedError("Authenticated user not found");
        const result = await UserService.findUserById(id, currentUser);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=user.controller.js.map