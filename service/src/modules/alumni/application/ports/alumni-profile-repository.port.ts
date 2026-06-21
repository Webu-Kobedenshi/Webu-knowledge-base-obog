import type { Department } from "../../../../common/domain/department";
import type {
  JobHuntingPeriod,
  SelectionFormat,
  SelectionStepKind,
} from "../../domain/entities/alumni-profile.entity";
import type {
  AlumniConnectionDto,
  AlumniListConnectionDto,
  AlumniProfileDto,
} from "../../domain/read-models/alumni.read-model";

export const ALUMNI_PROFILE_REPOSITORY = Symbol("ALUMNI_PROFILE_REPOSITORY");

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
  motivation?: string;
  activityPeriod?: JobHuntingPeriod;
  activityPeriodNote?: string;
  overallTip?: string;
  steps?: SelectionStepPersistenceInput[];
};

export type CompanyExperiencePersistenceInput = {
  companyName: string;
  isPublic: boolean;
  motivation?: string;
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
  xUrl?: string;
  instagramUrl?: string;
  isPublic: boolean;
  acceptContact: boolean;
  skills?: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
  activityPeriod?: JobHuntingPeriod;
  activityPeriodNote?: string;
};

export type FindPublicAlumniListParams = {
  department?: Department;
  company?: string;
  graduationYear?: number;
  sort?: "DEFAULT" | "HELPFUL";
  limit: number;
  offset: number;
};

export interface AlumniProfileRepositoryPort {
  findPublicList(params: FindPublicAlumniListParams): Promise<AlumniConnectionDto>;
  findPublicListItems(params: FindPublicAlumniListParams): Promise<AlumniListConnectionDto>;
  findPublicCompanyNameSuggestions(query: string, limit: number): Promise<string[]>;
  findPublicById(id: string, viewerUserId?: string): Promise<AlumniProfileDto | null>;
  upsertAlumniProfile(
    userId: string,
    input: UpdateAlumniProfilePersistenceInput,
  ): Promise<AlumniProfileDto>;
  updateAvatarUrl(userId: string, avatarUrl: string): Promise<AlumniProfileDto | null>;
  toggleHelpfulReaction(alumniProfileId: string, userId: string): Promise<AlumniProfileDto | null>;
}
