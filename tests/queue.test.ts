import { describe, expect, it } from "vitest";
import { actionsFor, transitionFor } from "../src/lib/queue";

describe("clinic queue state machine", () => {
  it("allows only the forward operational path", () => {
    expect(actionsFor("scheduled")).toEqual(["check_in"]);
    expect(actionsFor("waiting")).toEqual(["start_consultation"]);
    expect(actionsFor("in_consultation")).toEqual(["complete"]);
    expect(actionsFor("completed")).toEqual([]);
  });

  it("maps actions to auditable transitions", () => {
    expect(transitionFor("check_in")).toEqual({ from: "scheduled", to: "waiting", event: "patient_checked_in" });
    expect(transitionFor("complete").to).toBe("completed");
  });
});
