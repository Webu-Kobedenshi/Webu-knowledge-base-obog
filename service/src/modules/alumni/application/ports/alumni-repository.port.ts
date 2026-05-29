import type {
  AlumniConnectionDto,
  AlumniProfileDto,
  UserDto,
} from "../../domain/read-models/alumni.read-model";
import type { Department } from "../../domain/types/department";
import type { UserRole, UserStatus } from "../../domain/types/user";
import type { SelectionFormat, SelectionStepKind } from "../dto/alumni.input";

export const ALUMNI_REPOSITORY = Symbol("ALUMNI_REPOSITORY");

export type InitialSettingsPersistenceInput = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
  role: UserRole;
  status: UserStatus;
};

export type SelectionStepPersistenceInput = {
  stepKind: SelectionStepKind;
  format?: SelectionFormat;
  interviewerCount?: number;
  durationMinutes?: number;
  questions?: string;
  atmosphere?: string;
  preparation?: string;
};

export type SelectionExperiencePersistenceInput = {
  entryTrigger?: string;
  overallTip?: string;
  steps?: SelectionStepPersistenceInput[];
};

export type CompanyExperiencePersistenceInput = {
  companyName: string;
  selectionExperience?: SelectionExperiencePersistenceInput | null;
};

export type UpdateAlumniProfilePersistenceInput = {
  nickname?: string;
  graduationYear: number;
  department: Department;
  companyNames: string[];
  companyExperiences?: CompanyExperiencePersistenceInput[];
  remarks?: string;
  contactEmail?: string;
  isPublic: boolean;
  acceptContact: boolean;
  skills?: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
};

export type FindPublicAlumniListParams = {
  department?: Department;
  company?: string;
  graduationYear?: number;
  limit: number;
  offset: number;
};

export interface AlumniRepositoryPort {
  findPublicList(params: FindPublicAlumniListParams): Promise<AlumniConnectionDto>;
  findPublicById(id: string): Promise<AlumniProfileDto | null>;
  findUserById(userId: string): Promise<UserDto | null>;
  findUserByLinkedGmail(gmail: string): Promise<UserDto | null>;
  updateInitialSettings(userId: string, input: InitialSettingsPersistenceInput): Promise<UserDto>;
  upsertAlumniProfile(
    userId: string,
    input: UpdateAlumniProfilePersistenceInput,
  ): Promise<AlumniProfileDto>;
  updateAvatarUrl(userId: string, avatarUrl: string): Promise<AlumniProfileDto | null>;
  updateLinkedGmail(userId: string, gmail: string | null): Promise<UserDto>;
  deleteUserById(userId: string): Promise<boolean>;
}
