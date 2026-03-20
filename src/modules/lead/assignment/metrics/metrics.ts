// src/modules/lead/assignment/metrics.ts
/**
 * Placeholder metric helpers.
 * When you integrate Prometheus / metrics module, wire these to real counters/histograms.
 *
 * For now they are no-ops or console logs to indicate intended places.
 */

export function incAssignmentAttempt() {
  // TODO: prometheus - increment lead_assignment_attempts_total
  // console.debug("metrics: incAssignmentAttempt");
}

export function incAssignmentSuccess() {
  // TODO: prometheus - increment lead_assignment_success_total
  // console.debug("metrics: incAssignmentSuccess");
}

export function incAssignmentEscalated() {
  // TODO: prometheus - increment lead_assignment_escalated_total
  // console.debug("metrics: incAssignmentEscalated");
}
