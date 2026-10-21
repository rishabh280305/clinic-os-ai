export type QueueState = "scheduled" | "waiting" | "in_consultation" | "completed";
export type QueueAction = "check_in" | "start_consultation" | "complete";

const transitions: Record<QueueAction, { from: QueueState; to: QueueState; event: string }> = {
  check_in: { from: "scheduled", to: "waiting", event: "patient_checked_in" },
  start_consultation: { from: "waiting", to: "in_consultation", event: "consultation_started" },
  complete: { from: "in_consultation", to: "completed", event: "consultation_completed" },
};

export function transitionFor(action: QueueAction) {
  return transitions[action];
}

export function actionsFor(state: QueueState): QueueAction[] {
  if (state === "scheduled") return ["check_in"];
  if (state === "waiting") return ["start_consultation"];
  if (state === "in_consultation") return ["complete"];
  return [];
}
