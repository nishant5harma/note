// tests/common/factories/scenarios/inventory.scenario.ts
import { prisma } from "../../../../db/db.js";
import { projectFactory, unitFactory } from "../index.js";
/* ------------------------------------------------------------------ */
/* Scenarios                                                           */
/* ------------------------------------------------------------------ */
export async function createProjectWithUnit(overrides = {}) {
    const project = await projectFactory.create({
        ...(overrides.project ?? {}),
    });
    const unit = await unitFactory.create({
        projectId: project.id,
        ...(overrides.unit ?? {}),
    });
    return { project, unit };
}
export async function createListingWithProject(overrides = {}) {
    const project = await projectFactory.create({
        ...(overrides.project ?? {}),
    });
    const listing = await prisma.listing.create({
        data: {
            projectId: project.id,
            title: "Test Listing",
            type: "SALE",
            ...(overrides.listing ?? {}),
        },
    });
    return { project, listing };
}
//# sourceMappingURL=inventory.scenario.js.map