import { jest, describe, it, expect } from "@jest/globals";
import { requirePermission } from "../require-premission.middleware.js";
import {
  userFactory,
  roleFactory,
  permissionFactory,
} from "@/tests/common/factories/index.js";

describe("requirePermission Middleware (Integration)", () => {
  it("allows user with permission", async () => {
    // ARRANGE
    const perm = await permissionFactory.create({ key: "x.read" });
    const role = await roleFactory.create({ permissions: [perm] });
    const user = await userFactory.create({ roles: [role] });

    const req: any = { user: { id: user.id } };
    const mw = requirePermission("x", "read");
    const next = jest.fn();

    // ACT
    await mw(req, {} as any, next);

    // ASSERT
    expect(next).toHaveBeenLastCalledWith();
    expect(req.permissions.has("x.read")).toBe(true);
  });

  it("blocks user without permission (no roles assigned)", async () => {
    // ARRANGE: User created with empty roles array
    const user = await userFactory.create({ roles: [] });

    const req: any = { user: { id: user.id } };
    const mw = requirePermission("x", "read");
    const next = jest.fn();

    // ACT
    await mw(req, {} as any, next);

    // ASSERT
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: "User has no roles assigned",
      })
    );
  });

  it("blocks user who has a role but missing the specific permission", async () => {
    // ARRANGE: Role has no permissions
    const role = await roleFactory.create({ permissions: [] });
    const user = await userFactory.create({ roles: [role] });

    const req: any = { user: { id: user.id } };
    const mw = requirePermission("x", "read");
    const next = jest.fn();

    // ACT
    await mw(req, {} as any, next);

    // ASSERT
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: "Missing permission: x.read",
      })
    );
  });

  it("allows access via wildcard permission (e.g., x.*)", async () => {
    // ARRANGE
    const perm = await permissionFactory.create({ key: "audit.*" });
    const role = await roleFactory.create({ permissions: [perm] });
    const user = await userFactory.create({ roles: [role] });

    const req: any = { user: { id: user.id } };
    const mw = requirePermission("audit", "delete");
    const next = jest.fn();

    // ACT
    await mw(req, {} as any, next);

    // ASSERT
    expect(next).toHaveBeenCalledWith();
    expect(req.permissions.has("audit.*")).toBe(true);
  });

  it("blocks user when they have a similar but incorrect permission", async () => {
    // ARRANGE
    const perm = await permissionFactory.create({ key: "audit.read" });
    const role = await roleFactory.create({ permissions: [perm] });
    const user = await userFactory.create({ roles: [role] });

    const req: any = { user: { id: user.id } };
    const mw = requirePermission("audit", "write");
    const next = jest.fn();

    // ACT
    await mw(req, {} as any, next);

    // ASSERT
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: "Missing permission: audit.write",
      })
    );
  });
});
