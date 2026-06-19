import type { Department } from "../types/department";
import type { UserRole, UserStatus } from "../types/user";

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  studentId: string | null;
  linkedGmail: string | null;
  role: UserRole;
  status: UserStatus;
  enrollmentYear: number | null;
  durationYears: number | null;
  department: Department | null;
  createdAt: Date;
  updatedAt: Date;
  alumniProfile?: AlumniProfileDto | null;
};

export type AlumniProfileDto = {
  id: string;
  userId: string;
  nickname: string | null;
  graduationYear: number;
  department: Department;
  companyNames: string[];
  companyExperiences: CompanyExperienceDto[];
  helpfulReaction: HelpfulReactionSummaryDto;
  remarks: string | null;
  contactEmail: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  avatarUrl: string | null;
  skills: string[];
  portfolioUrl: string | null;
  gakuchika: string | null;
  usefulCoursework: string | null;
  activityPeriod: JobHuntingPeriod | null;
  activityPeriodNote: string | null;
  isPublic: boolean;
  acceptContact: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserDto;
};

export type AlumniListCompanyExperienceDto = {
  id: string;
  companyName: string;
  isPublic: boolean;
  motivation: string | null;
  selectionExperience: { id: string; hasSelectionFlow: boolean } | null;
};

export type AlumniListItemDto = {
  id: string;
  userId: string;
  nickname: string | null;
  graduationYear: number;
  department: Department;
  companyNames: string[];
  companyExperiences: AlumniListCompanyExperienceDto[];
  helpfulReaction: HelpfulReactionSummaryDto;
  remarks: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  avatarUrl: string | null;
  skills: string[];
  hasPortfolio: boolean;
  hasGakuchika: boolean;
  hasUsefulCoursework: boolean;
  isPublic: boolean;
  acceptContact: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SelectionStepKind =
  | "DOCUMENT_SCREENING"
  | "WEB_TEST"
  | "ASSIGNMENT"
  | "CODING_TEST"
  | "CASUAL_INTERVIEW"
  | "FIRST_INTERVIEW"
  | "SECOND_INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER"
  | "OTHER";

export type SelectionFormat = "ONLINE" | "IN_PERSON" | "UNKNOWN";

export type JobHuntingPeriod =
  | "FIRST_YEAR_FIRST_HALF"
  | "FIRST_YEAR_SECOND_HALF"
  | "SECOND_YEAR_FIRST_HALF"
  | "SUMMER_BREAK"
  | "PRE_GRADUATION_AUTUMN"
  | "OTHER";

export type HelpfulReactionSummaryDto = {
  count: number;
  reactedByViewer: boolean;
};

export type SelectionStepDto = {
  id: string;
  stepKind: SelectionStepKind;
  format: SelectionFormat;
  interviewerCount: number | null;
  durationMinutes: number | null;
  questions: string | null;
  atmosphere: string | null;
  preparation: string | null;
  sortOrder: number;
};

export type SelectionExperienceDto = {
  id: string;
  entryTrigger: string | null;
  motivation: string | null;
  activityPeriod: JobHuntingPeriod | null;
  activityPeriodNote: string | null;
  overallTip: string | null;
  steps: SelectionStepDto[];
};

export type CompanyExperienceDto = {
  id: string;
  companyName: string;
  isPublic: boolean;
  motivation: string | null;
  selectionExperience: SelectionExperienceDto | null;
};

export type AlumniConnectionDto = {
  items: AlumniProfileDto[];
  totalCount: number;
  hasNextPage: boolean;
};

export type AlumniListConnectionDto = {
  items: AlumniListItemDto[];
  totalCount: number;
  hasNextPage: boolean;
};
