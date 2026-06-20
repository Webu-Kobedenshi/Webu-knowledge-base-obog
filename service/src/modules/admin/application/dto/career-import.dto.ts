import type { Department } from "../../../../common/domain/department";
import type { JobHuntingPeriod } from "../../../alumni/domain/entities/alumni-profile.entity";

export type CareerImportRowStatus = "VALID" | "ERROR" | "PENDING_USER";

export type CareerExcelImportRowInput = {
  rowNumber: number;
  studentId?: string | null;
  fullName?: string | null;
  department?: string | null;
  graduationYear?: string | null;
  companyName?: string | null;
  companyMotivation?: string | null;
  activityPeriod?: string | null;
  gakuchika?: string | null;
  email?: string | null;
  remarks?: string | null;
  consent?: string | null;
};

export type CareerExcelImportPreviewInput = {
  fileName: string;
  rows: CareerExcelImportRowInput[];
};

export type NormalizedCareerImportValues = {
  studentId: string;
  fullName: string;
  department: Department;
  graduationYear: number;
  companyName: string;
  companyMotivation: string;
  activityPeriod: JobHuntingPeriod;
  gakuchika: string;
  email?: string;
  remarks?: string;
  consent?: string;
};

export type CareerImportPreviewRowDto = {
  id: string;
  rowNumber: number;
  status: CareerImportRowStatus;
  errors: string[];
  studentId: string | null;
  fullName: string | null;
  department: Department | null;
  graduationYear: number | null;
  companyName: string | null;
  companyMotivation: string | null;
  activityPeriod: JobHuntingPeriod | null;
  gakuchika: string | null;
  matchedUserId: string | null;
  matchedAlumniProfileId: string | null;
  willOverwrite: boolean;
};

export type CareerImportPreviewDto = {
  batchId: string;
  fileName: string;
  totalCount: number;
  validCount: number;
  errorCount: number;
  pendingCount: number;
  overwriteCount: number;
  rows: CareerImportPreviewRowDto[];
};

export type CareerImportResultDto = {
  batchId: string;
  totalCount: number;
  appliedCount: number;
  skippedCount: number;
  pendingCount: number;
  errorCount: number;
};
