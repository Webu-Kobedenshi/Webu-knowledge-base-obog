import { DomainValidationError } from "../../../../common/domain/domain-validation.error";
import { InitialSettingsDraft } from "./initial-settings.entity";

describe("InitialSettingsDraft", () => {
  it("normalizes and resolves role/status for enrolled user", () => {
    const draft = InitialSettingsDraft.create(
      {
        name: "  Taro ",
        studentId: " 24A0001 ",
        enrollmentYear: 2025,
        department: "IT_EXPERT",
      },
      new Date("2026-04-13T00:00:00.000Z"),
    );

    expect(draft.toData()).toEqual({
      name: "Taro",
      studentId: "24A0001",
      enrollmentYear: 2025,
      durationYears: 4,
      department: "IT_EXPERT",
      role: "STUDENT",
      status: "ENROLLED",
    });
  });

  it("resolves alumni for graduated user", () => {
    const draft = InitialSettingsDraft.create(
      {
        name: "Hanako",
        studentId: "24A0002",
        enrollmentYear: 2020,
        department: "ADVANCED_STUDIES",
      },
      new Date("2026-01-01T00:00:00.000Z"),
    );

    expect(draft.toData().role).toBe("ALUMNI");
    expect(draft.toData().status).toBe("GRADUATED");
  });

  it("throws for empty name", () => {
    expect(() =>
      InitialSettingsDraft.create(
        {
          name: "   ",
          studentId: "24A0003",
          enrollmentYear: 2025,
          department: "IT_EXPERT",
        },
        new Date("2026-04-13T00:00:00.000Z"),
      ),
    ).toThrow(DomainValidationError);
  });
});
