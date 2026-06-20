import type { Department } from "../../../../common/domain/department";
import { DomainValidationError } from "../../../../common/domain/domain-validation.error";
import type { UserRole, UserStatus } from "../../../../common/domain/user";
import { getDurationYears } from "../department-duration";
import { resolveRoleAndStatus } from "../user-role-transition";

export type InitialSettingsDraftInput = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  department: Department;
};

export type InitialSettingsDraftData = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
  role: UserRole;
  status: UserStatus;
};

export class InitialSettingsDraft {
  private constructor(private readonly data: InitialSettingsDraftData) {}

  static create(input: InitialSettingsDraftInput, now: Date = new Date()): InitialSettingsDraft {
    const name = input.name.trim();
    if (!name) {
      throw new DomainValidationError("name is required");
    }

    const studentId = input.studentId.trim();
    if (!studentId) {
      throw new DomainValidationError("studentId is required");
    }

    const currentYear = now.getFullYear();
    if (input.enrollmentYear < 2000 || input.enrollmentYear > currentYear + 1) {
      throw new DomainValidationError("enrollmentYear is out of range");
    }

    const durationYears = getDurationYears(input.department);
    const resolved = resolveRoleAndStatus({
      enrollmentYear: input.enrollmentYear,
      durationYears,
      now,
    });

    return new InitialSettingsDraft({
      name,
      studentId,
      enrollmentYear: input.enrollmentYear,
      durationYears,
      department: input.department,
      role: resolved.role,
      status: resolved.status,
    });
  }

  toData(): InitialSettingsDraftData {
    return { ...this.data };
  }
}
