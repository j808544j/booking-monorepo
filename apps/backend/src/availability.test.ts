import { describe, expect, it } from "vitest";
import { generateSlots } from "./availability";

describe("generateSlots", () => {
  it("generates slots within the given range", () => {
    const from = new Date("2024-01-01T09:00:00.000Z");
    const to = new Date("2024-01-01T11:00:00.000Z");

    const slots = generateSlots(from, to);

    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const start = new Date(slot.start).getTime();
      const end = new Date(slot.end).getTime();
      expect(start).toBeGreaterThanOrEqual(from.getTime());
      expect(end).toBeLessThanOrEqual(to.getTime());
      expect(end).toBeGreaterThan(start);
    }
  });

  it("returns an empty array when range is zero", () => {
    const at = new Date("2024-01-01T09:00:00.000Z");
    const slots = generateSlots(at, at);
    expect(slots).toEqual([]);
  });
});

