// /src/modules/cold-call/routing/util/extract-teams.util.ts

export function extractTeamIds(batch: any): string[] {
  let teamIds: string[] = [];

  if (
    batch.teamConfig &&
    typeof batch.teamConfig === "object" &&
    Array.isArray((batch.teamConfig as any).selectedTeamIds)
  ) {
    teamIds = ((batch.teamConfig as any).selectedTeamIds as string[]).slice();
  }

  const rc = batch.routingConfig ?? {};
  const rules =
    rc && typeof rc === "object" && Array.isArray((rc as any).rules)
      ? (rc as any).rules
      : [];

  if (teamIds.length > 0 || rules.length === 0) return teamIds;

  const derived = new Set<string>();

  for (const r of rules) {
    const cfg = r.config ?? {};

    if (r.kind === "default" && Array.isArray(cfg.teamIds)) {
      for (const t of cfg.teamIds) if (typeof t === "string") derived.add(t);
    }

    if (r.kind === "location" && cfg.map && typeof cfg.map === "object") {
      for (const v of Object.values(cfg.map)) {
        if (typeof v === "string") derived.add(v);
        else if (v && typeof v === "object") {
          if (typeof (v as any).teamId === "string")
            derived.add((v as any).teamId);
        }
      }
    }

    if (r.kind === "budget" && Array.isArray(cfg.ranges)) {
      for (const rng of cfg.ranges) {
        if (rng && typeof rng.teamId === "string") derived.add(rng.teamId);
      }
    }
  }

  return Array.from(derived);
}
