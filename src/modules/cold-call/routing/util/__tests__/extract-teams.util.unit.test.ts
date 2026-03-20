// src/modules/cold-call/routing/util/__tests__/extract-teams.util.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { extractTeamIds } from "../extract-teams.util.js";

describe("extractTeamIds", () => {
  it("uses teamConfig.selectedTeamIds when present", () => {
    const batch = {
      teamConfig: { selectedTeamIds: ["A", "B"] },
      routingConfig: {},
    };

    expect(extractTeamIds(batch)).toEqual(["A", "B"]);
  });

  it("derives teams from routing rules", () => {
    const batch = {
      routingConfig: {
        rules: [
          { kind: "default", config: { teamIds: ["X"] } },
          {
            kind: "location",
            config: { map: { delhi: "Y" } },
          },
        ],
      },
    };

    expect(extractTeamIds(batch).sort()).toEqual(["X", "Y"]);
  });
});
