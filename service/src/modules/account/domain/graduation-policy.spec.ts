import { calculateGraduationYear, isGraduatedAt } from "./graduation-policy";

describe("graduation-policy", () => {
  it("calculates graduation year", () => {
    expect(calculateGraduationYear(2023, 4)).toBe(2027);
  });

  it("returns true when current year is after threshold", () => {
    expect(
      isGraduatedAt({
        enrollmentYear: 2020,
        durationYears: 2,
        now: new Date("2023-04-01T00:00:00.000Z"),
      }),
    ).toBe(true);
  });

  it("returns false when current year is threshold year", () => {
    expect(
      isGraduatedAt({
        enrollmentYear: 2020,
        durationYears: 2,
        now: new Date("2021-04-01T00:00:00.000Z"),
      }),
    ).toBe(false);
  });
});
