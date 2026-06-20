import type { UserRole, UserStatus } from "../../../common/domain/user";
import { calculateGraduationYear, isGraduatedAt } from "./graduation-policy";

export type RoleStatusResolutionInput = {
  enrollmentYear: number;
  durationYears: number;
  now?: Date;
};

export type RoleStatusResolution = {
  role: UserRole;
  status: UserStatus;
  graduationYear: number;
};

export function resolveRoleAndStatus(input: RoleStatusResolutionInput): RoleStatusResolution {
  const graduationYear = calculateGraduationYear(input.enrollmentYear, input.durationYears);
  const graduated = isGraduatedAt(input);

  return {
    role: graduated ? "ALUMNI" : "STUDENT",
    status: graduated ? "GRADUATED" : "ENROLLED",
    graduationYear,
  };
}
