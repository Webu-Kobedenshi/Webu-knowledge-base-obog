import { getDurationYears } from "./department-duration";

describe("getDurationYears", () => {
  it("returns 4 for IT_EXPERT and GAME_RESEARCH", () => {
    expect(getDurationYears("IT_EXPERT")).toBe(4);
    expect(getDurationYears("GAME_RESEARCH")).toBe(4);
  });

  it("returns 3 for IT_SPECIALIST and GAME_ENGINEER", () => {
    expect(getDurationYears("IT_SPECIALIST")).toBe(3);
    expect(getDurationYears("GAME_ENGINEER")).toBe(3);
  });

  it("returns 1 for ADVANCED_STUDIES", () => {
    expect(getDurationYears("ADVANCED_STUDIES")).toBe(1);
  });

  it("returns 2 for other departments", () => {
    expect(getDurationYears("PROGRAMMING")).toBe(2);
  });
});
