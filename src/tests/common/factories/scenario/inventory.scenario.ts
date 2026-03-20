// tests/common/factories/scenarios/inventory.scenario.ts
import { prisma } from "@/db/db.js";
import { projectFactory, unitFactory } from "../index.js";
import type { Project, Unit, Listing, Prisma } from "@prisma/client";

/* ------------------------------------------------------------------ */
/* Factory-safe override types (Fishery)                               */
/* ------------------------------------------------------------------ */

type ProjectFactoryOverrides = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt">
>;

type UnitFactoryOverrides = Partial<
  Omit<Unit, "id" | "createdAt" | "updatedAt">
>;

/* ------------------------------------------------------------------ */
/* Prisma create override types                                        */
/* ------------------------------------------------------------------ */

type ListingCreateOverrides = Partial<
  Omit<Prisma.ListingUncheckedCreateInput, "projectId">
>;

/* ------------------------------------------------------------------ */
/* Scenario containers                                                 */
/* ------------------------------------------------------------------ */

export interface ProjectWithUnitOverrides {
  project?: ProjectFactoryOverrides;
  unit?: UnitFactoryOverrides;
}

export interface ListingWithProjectOverrides {
  project?: ProjectFactoryOverrides;
  listing?: ListingCreateOverrides;
}

/* ------------------------------------------------------------------ */
/* Scenarios                                                           */
/* ------------------------------------------------------------------ */

export async function createProjectWithUnit(
  overrides: ProjectWithUnitOverrides = {}
): Promise<{ project: Project; unit: Unit }> {
  const project = await projectFactory.create({
    ...(overrides.project ?? {}),
  });

  const unit = await unitFactory.create({
    projectId: project.id,
    ...(overrides.unit ?? {}),
  });

  return { project, unit };
}

export async function createListingWithProject(
  overrides: ListingWithProjectOverrides = {}
): Promise<{ project: Project; listing: Listing }> {
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
