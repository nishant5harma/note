// src/dto/__tests__/user.dto.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { userIdToUserDTO } from "../../dto/user.dto.js";
import { userFactory, roleFactory, teamFactory, teamMemberFactory, } from "../../tests/common/factories/index.js";
describe("UserDTO integration", () => {
    it("maps roles and team memberships correctly (Happy Path)", async () => {
        // 1. Setup complex user using factories
        // We create specific roles so we can assert on their names later
        const role0 = await roleFactory.create({ name: "Admin" });
        const role1 = await roleFactory.create({ name: "Editor" });
        const user = await userFactory.create({
            name: "Full User",
            roles: [role0, role1],
        });
        const team = await teamFactory.create({ name: "Sales" });
        // Connect user to team
        await teamMemberFactory.create({
            userId: user.id,
            teamId: team.id,
            role: "LEAD",
        });
        // 2. Execute
        const dto = await userIdToUserDTO(user.id);
        // 3. Detailed Assertions
        expect(dto.id).toBe(user.id);
        expect(dto.email).toBe(user.email);
        expect(dto.name).toBe(user.name);
        // Check roles (mapped to names)
        expect(dto.roles).toHaveLength(2);
        expect(dto.roles).toContain("Admin");
        expect(dto.roles).toContain("Editor");
        // Check team mapping
        expect(dto.teamMembers).toHaveLength(1);
        expect(dto.teamMembers?.[0]).toMatchObject({
            teamId: team.id,
            teamName: "Sales",
            role: "LEAD",
        });
    });
    it("handles a user with no roles or teams gracefully", async () => {
        const user = await userFactory.create({
            name: "Empty User",
        });
        const dto = await userIdToUserDTO(user.id);
        // Ensure DTO returns empty arrays for collections, not null/undefined
        expect(dto.roles).toEqual([]);
        expect(dto.teamMembers).toEqual([]);
    });
    it("throws correctly when user ID is not found", async () => {
        // Using a valid UUID format that definitely doesn't exist
        const fakeId = "00000000-0000-0000-0000-000000000000";
        await expect(userIdToUserDTO(fakeId)).rejects.toThrow();
    });
});
//# sourceMappingURL=user.dto.integration.test.js.map