import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { priorityForAmount } from "./types.ts";

describe("lost money priority", () => {
  it("marks large or very idle opportunities as high", () => {
    assert.equal(priorityForAmount(2000, 10), "high");
    assert.equal(priorityForAmount(100, 90), "high");
  });

  it("marks modest idle as medium", () => {
    assert.equal(priorityForAmount(600, 20), "medium");
    assert.equal(priorityForAmount(80, 50), "medium");
  });

  it("marks small recent items as low", () => {
    assert.equal(priorityForAmount(80, 10), "low");
  });
});
