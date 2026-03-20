import type { Project, Unit, Listing, Prisma } from "@prisma/client";
type ProjectFactoryOverrides = Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>;
type UnitFactoryOverrides = Partial<Omit<Unit, "id" | "createdAt" | "updatedAt">>;
type ListingCreateOverrides = Partial<Omit<Prisma.ListingUncheckedCreateInput, "projectId">>;
export interface ProjectWithUnitOverrides {
    project?: ProjectFactoryOverrides;
    unit?: UnitFactoryOverrides;
}
export interface ListingWithProjectOverrides {
    project?: ProjectFactoryOverrides;
    listing?: ListingCreateOverrides;
}
export declare function createProjectWithUnit(overrides?: ProjectWithUnitOverrides): Promise<{
    project: Project;
    unit: Unit;
}>;
export declare function createListingWithProject(overrides?: ListingWithProjectOverrides): Promise<{
    project: Project;
    listing: Listing;
}>;
export {};
//# sourceMappingURL=inventory.scenario.d.ts.map