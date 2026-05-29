import type { Department } from "../../domain/types/department";

export type InitialSettingsInput = {
  name: string;
  studentId: string;
  enrollmentYear: number;
  durationYears: number;
  department: Department;
};

export type UpdateAlumniProfileInput = {
  nickname?: string;
  graduationYear: number;
  department: Department;
  companyNames: string[];
  companyExperiences?: CompanyExperienceInput[];
  remarks?: string;
  contactEmail?: string;
  isPublic?: boolean;
  acceptContact?: boolean;
  skills?: string[];
  portfolioUrl?: string;
  gakuchika?: string;
  usefulCoursework?: string;
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
  overallTip?: string;
  steps?: SelectionStepInput[];
};

export type CompanyExperienceInput = {
  companyName: string;
  selectionExperience?: SelectionExperienceInput | null;
};

export type UploadUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
};
