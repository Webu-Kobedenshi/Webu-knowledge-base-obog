import type {
  JobHuntingPeriod,
  SelectionFormat,
  SelectionStepKind,
} from "../../domain/entities/alumni-profile.entity";
import type { Department } from "../../domain/types/department";

export type InitialSettingsInput = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
};

export type AdminNameInput = {
  name: string;
};

export type UpdateAlumniProfileInput = {
  nickname?: string;
  graduationYear: number;
  department: Department;
  companyNames: string[];
  companyExperiences?: CompanyExperienceInput[];
  remarks?: string;
  contactEmail?: string;
  xUrl?: string;
  instagramUrl?: string;
  isPublic?: boolean;
  acceptContact?: boolean;
  skills?: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
  activityPeriod?: JobHuntingPeriod;
  activityPeriodNote?: string;
};

export type SelectionStepInput = {
  stepKind: SelectionStepKind;
  format?: SelectionFormat;
  interviewerCount?: number;
  durationMinutes?: number;
  questions?: string;
  atmosphere?: string;
  preparation?: string;
};

export type SelectionExperienceInput = {
  entryTrigger?: string;
  motivation?: string;
  activityPeriod?: JobHuntingPeriod;
  activityPeriodNote?: string;
  overallTip?: string;
  steps?: SelectionStepInput[];
};

export type CompanyExperienceInput = {
  companyName: string;
  isPublic?: boolean;
  motivation?: string;
  selectionExperience?: SelectionExperienceInput | null;
};

export type UploadUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
};
