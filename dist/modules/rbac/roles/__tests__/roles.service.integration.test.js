// src/modules/rbac/roles/__tests__/roles.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { RoleService } from "../roles.service.js";
import { prisma } from "../../../../db/db.js";
import { userFactory } from "../../../../tests/common/factories/index.js";
describe("Role Service (Integration)", () => {
    describe("createRole", () => {
        it("should create a role with valid data", async () => {
            const role = await RoleService.createRole({
                name: "Admin",
                description: "Superuser",
            });
            expect(role.id).toBeDefined();
            expect(role.name).toBe("Admin");
        });
    });
    describe("updateRole", () => {
        it("should update only provided fields (partial update)", async () => {
            const role = await RoleService.createRole({
                name: "Original Name",
                description: "Original Description",
            });
            // Update only description
            const updated = await RoleService.updateRole(role.id, {
                description: "New Description",
            });
            expect(updated.description).toBe("New Description");
            expect(updated.name).toBe("Original Name"); // Name should remain untouched
        });
    });
    describe("Permission Assignment", () => {
        it("should link and unlink a permission to a role", async () => {
            const role = await RoleService.createRole({ name: "Editor" });
            const perm = await prisma.permission.create({
                data: { key: "edit:post" },
            });
            await RoleService.assignPermission(role.id, perm.id);
            const perms = await RoleService.getRolePermissions(role.id);
            expect(perms).toHaveLength(1);
            expect(perms[0].permission.key).toBe("edit:post");
            await RoleService.removePermission(role.id, perm.id);
            const permsAfter = await RoleService.getRolePermissions(role.id);
            expect(permsAfter).toHaveLength(0);
        });
        it("should throw error when removing a non-existent permission link", async () => {
            const role = await RoleService.createRole({ name: "Empty Role" });
            await expect(RoleService.removePermission(role.id, "non-existent-id")).rejects.toThrow();
        });
    });
    describe("User-Role Assignment", () => {
        it("should assign and remove roles from users", async () => {
            const user = await userFactory.create();
            const role = await RoleService.createRole({ name: "Manager" });
            await RoleService.assignRoleToUser(user.id, role.id);
            const roleInDb = await RoleService.getRoleById(role.id);
            expect(roleInDb?.users).toHaveLength(1);
            expect(roleInDb?.users[0].userId).toBe(user.id);
            await RoleService.removeRoleFromUser(user.id, role.id);
            const roleAfter = await RoleService.getRoleById(role.id);
            expect(roleAfter?.users).toHaveLength(0);
        });
    });
    describe("deleteRole", () => {
        it("should prevent deletion if assigned to users", async () => {
            const user = await userFactory.create();
            const role = await RoleService.createRole({ name: "Staff" });
            await RoleService.assignRoleToUser(user.id, role.id);
            await expect(RoleService.deleteRole(role.id)).rejects.toThrow("Role is assigned to users. Unassign before deleting.");
        });
        it("should delete successfully if not assigned", async () => {
            const role = await RoleService.createRole({ name: "Temporary" });
            await RoleService.deleteRole(role.id);
            const found = await prisma.role.findUnique({ where: { id: role.id } });
            expect(found).toBeNull();
        });
    });
});
//# sourceMappingURL=roles.service.integration.test.js.map