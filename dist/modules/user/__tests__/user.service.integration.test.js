// src/modules/user/__tests__/user.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { UserService } from "../user.service.js";
import { prisma } from "../../../db/db.js";
import { userFactory, roleFactory, teamFactory, } from "../../../tests/common/factories/index.js";
import bcrypt from "bcrypt";
describe("User Service (Integration)", () => {
    describe("createUser", () => {
        it("should create a user, hash password, and link roles", async () => {
            const role1 = await roleFactory.create({ name: "Admin" });
            const role2 = await roleFactory.create({ name: "Manager" });
            // Guard: Ensure factories returned IDs
            if (!role1.id || !role2.id)
                throw new Error("Setup failed: Role IDs missing");
            const userData = {
                name: "Test User",
                email: "test@example.com",
                password: "securepassword",
                roleIds: [role1.id, role2.id],
            };
            const result = await UserService.createUser(userData);
            expect(result.user.name).toBe(userData.name);
            expect(result.user.roles).toHaveLength(2);
            const dbUser = await prisma.user.findUnique({
                where: { id: result.user.id },
            });
            if (!dbUser)
                throw new Error("User not found in DB");
            const isPasswordValid = await bcrypt.compare(userData.password, dbUser.passwordHash);
            expect(isPasswordValid).toBe(true);
        });
        it("should link a user to a team and record 'assignedBy' meta if currentUser is provided", async () => {
            const role = await roleFactory.create();
            const team = await teamFactory.create({ name: "Sales Team" });
            const adminUser = await userFactory.create({ email: "admin@test.com" });
            if (!role.id || !team.id || !adminUser.id)
                throw new Error("Setup failed: IDs missing");
            const userData = {
                name: "Sales Agent",
                email: "agent@example.com",
                password: "password123",
                roleIds: [role.id],
                teamId: team.id,
            };
            // Pass adminUser as the currentUser context
            const result = await UserService.createUser(userData, {
                id: adminUser.id,
                email: adminUser.email,
                roles: [],
            });
            expect(result.user.teamMembers).toHaveLength(1);
            expect(result.user.teamMembers[0].teamName).toBe("Sales Team");
            const membership = await prisma.teamMember.findFirst({
                where: { userId: result.user.id, teamId: team.id },
            });
            expect(membership).toBeDefined();
            // Check logic: meta should contain assignedBy
            expect(membership?.meta?.assignedBy).toBe(adminUser.id);
        });
        it("should throw BadRequestError if teamId is invalid", async () => {
            const role = await roleFactory.create();
            if (!role.id)
                throw new Error("Setup failed: Role ID missing");
            const userData = {
                name: "Error User",
                email: "error@example.com",
                password: "password123",
                roleIds: [role.id],
                teamId: "non-existent-team-id",
            };
            await expect(UserService.createUser(userData)).rejects.toThrow("Invalid teamId provided");
        });
        it("should throw BadRequestError if roleIds array is empty", async () => {
            const userData = {
                name: "No Role User",
                email: "norole@example.com",
                password: "password123",
                roleIds: [],
            };
            await expect(UserService.createUser(userData)).rejects.toThrow("At least one roleId is required");
        });
    });
    describe("listUsers", () => {
        it("should return a list of users with their roles and team memberships", async () => {
            const role = await roleFactory.create({ name: "Agent" });
            const team = await teamFactory.create({ name: "Support" });
            const u1 = await userFactory.create({
                name: "User One",
                email: "u1@test.com",
            });
            const u2 = await userFactory.create({
                name: "User Two",
                email: "u2@test.com",
            });
            if (!role.id || !team.id || !u1.id || !u2.id)
                throw new Error("Setup failed: IDs missing");
            await prisma.userRole.create({
                data: { userId: u1.id, roleId: role.id },
            });
            await prisma.teamMember.create({
                data: { userId: u1.id, teamId: team.id },
            });
            const result = await UserService.listUsers();
            expect(result.users.length).toBeGreaterThanOrEqual(2);
            const foundU1 = result.users.find((u) => u.id === u1.id);
            expect(foundU1).toBeDefined();
            expect(foundU1?.roles[0].name).toBe("Agent");
            expect(foundU1?.teamMembers[0].teamName).toBe("Support");
        });
    });
    describe("findUserById", () => {
        it("should return user details with roles and team memberships", async () => {
            const role = await roleFactory.create({ name: "Lead" });
            const team = await teamFactory.create({ name: "Engineering" });
            const user = await userFactory.create();
            if (!user.id || !role.id || !team.id)
                throw new Error("Setup failed: IDs missing");
            await prisma.userRole.create({
                data: { userId: user.id, roleId: role.id },
            });
            await prisma.teamMember.create({
                data: { userId: user.id, teamId: team.id, role: "MEMBER" },
            });
            const result = await UserService.findUserById(user.id);
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(user.email);
            expect(result.user.roles[0].name).toBe("Lead");
            expect(result.user.teamMembers[0].teamName).toBe("Engineering");
        });
        it("should throw NotFoundError if user does not exist", async () => {
            await expect(UserService.findUserById("non-existent-id")).rejects.toThrow("User not found");
        });
    });
});
//# sourceMappingURL=user.service.integration.test.js.map