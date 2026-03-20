// src/modules/rbac/permissions/__tests__/permission.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { PermissionService } from "../permissions.service.js";
import { prisma } from "@/db/db.js";

describe("Permission Service (Integration)", () => {
  describe("createPermission", () => {
    it("should create a permission and force the key to lowercase", async () => {
      const data = {
        key: "USER:READ",
        description: "Allows reading users",
        module: "UserManagement",
      };

      const perm = await PermissionService.createPermission(data);

      expect(perm.key).toBe("user:read"); // Normalization check
      expect(perm.module).toBe(data.module);
    });

    it("should throw error if duplicate key is used", async () => {
      await PermissionService.createPermission({ key: "test" });
      await expect(
        PermissionService.createPermission({ key: "test" })
      ).rejects.toThrow();
    });
  });

  describe("updatePermission", () => {
    it("should update only provided fields and normalize the key", async () => {
      const perm = await PermissionService.createPermission({ key: "old:key" });

      const updated = await PermissionService.updatePermission(perm.id, {
        key: "NEW:KEY",
      });

      expect(updated.key).toBe("new:key");
      expect(updated.description).toBeNull(); // Untouched field remains null
    });
    // Add to describe("updatePermission", ...)
    it("should allow clearing description and module by passing null", async () => {
      const perm = await PermissionService.createPermission({
        key: "test:meta",
        description: "Initial",
        module: "Initial",
      });

      // We cast to any here because our validator might technically
      // expect strings, but the service logic handles nulls.
      const updated = await PermissionService.updatePermission(perm.id, {
        description: null as any,
        module: null as any,
      });

      expect(updated.description).toBeNull();
      expect(updated.module).toBeNull();
      expect(updated.key).toBe("test:meta"); // Key remains unchanged
    });

    it("should throw a Prisma error when updating to a key that already exists", async () => {
      await PermissionService.createPermission({ key: "perm:a" });
      const b = await PermissionService.createPermission({ key: "perm:b" });

      await expect(
        PermissionService.updatePermission(b.id, { key: "perm:a" })
      ).rejects.toThrow(); // Prisma P2002 Unique constraint error
    });
  });

  describe("deletePermission", () => {
    it("should delete a permission if not assigned to any role", async () => {
      const perm = await PermissionService.createPermission({
        key: "to:delete",
      });
      await PermissionService.deletePermission(perm.id);

      const found = await prisma.permission.findUnique({
        where: { id: perm.id },
      });
      expect(found).toBeNull();
    });

    it("should throw error if permission is assigned to a role", async () => {
      // Setup: Create permission, role, and the link
      const perm = await PermissionService.createPermission({
        key: "assigned:perm",
      });
      const role = await prisma.role.create({ data: { name: "Admin" } });
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      });

      await expect(PermissionService.deletePermission(perm.id)).rejects.toThrow(
        "Permission assigned to roles. Revoke before deleting."
      );
    });
  });
});
