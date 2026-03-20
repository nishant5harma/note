// /src/modules/cold-call/routing/decorators/base.decorator.ts

// JSON-safe continue token
export interface ContinueToken {
  __continue: true;
}

// Factory function
export function CONTINUE(): ContinueToken {
  return { __continue: true };
}

export type DecoratorReturn = string | null | ContinueToken;

export interface RoutingContext {
  entry: any; // ColdCallEntry
  batch: any; // ColdCallBatch
  availableTeams: string[];

  assignedTeamId?: string | null;
  previousContinue?: boolean;

  meta?: Record<string, any>; // <-- meta chaining
}

export interface RoutingDecorator {
  kind: string;
  config?: any;
  apply(ctx: RoutingContext): Promise<DecoratorReturn>;
}
