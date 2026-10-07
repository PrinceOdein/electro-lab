import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./assistant-prompt";

describe("buildSystemPrompt", () => {
  it("tells students not to just hand over practical-question answers", () => {
    const prompt = buildSystemPrompt("STUDENT", "Chidi");
    expect(prompt).toMatch(/do not give the final number or answer directly/i);
    expect(prompt).toContain("Chidi");
  });

  it("gives instructors full technical depth instead of the hint-only guardrail", () => {
    const prompt = buildSystemPrompt("INSTRUCTOR", "Dr. Okafor");
    expect(prompt).not.toMatch(/do not give the final number or answer directly/i);
    expect(prompt).toMatch(/full technical depth/i);
    expect(prompt).toContain("Dr. Okafor");
  });
});
