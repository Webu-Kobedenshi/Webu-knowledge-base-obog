import type { Department } from "../../../../common/domain/department";
import type { UserRole, UserStatus } from "../../../../common/domain/user";
import type { UserDto } from "../../../alumni/domain/read-models/alumni.read-model";

export const ACCOUNT_REPOSITORY = Symbol("ACCOUNT_REPOSITORY");

export type InitialSettingsPersistenceInput = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
  role: UserRole;
  status: UserStatus;
};

export interface AccountRepositoryPort {
  findUserById(userId: string): Promise<UserDto | null>;
  findUserByEmail(email: string): Promise<UserDto | null>;
  findUserByLinkedGmail(gmail: string): Promise<UserDto | null>;
  isAdminEmail(email: string): Promise<boolean>;
  updateInitialSettings(userId: string, input: InitialSettingsPersistenceInput): Promise<UserDto>;
  updateAdminName(userId: string, name: string): Promise<UserDto>;
  updateLinkedGmail(userId: string, gmail: string | null): Promise<UserDto>;
  deleteUserById(userId: string): Promise<boolean>;
}
