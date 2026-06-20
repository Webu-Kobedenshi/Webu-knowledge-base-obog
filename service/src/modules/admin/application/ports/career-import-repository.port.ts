import type {
  CareerImportPreviewDto,
  CareerImportPreviewRowDto,
  NormalizedCareerImportValues,
} from "../dto/career-import.dto";

export const CAREER_IMPORT_REPOSITORY = Symbol("CAREER_IMPORT_REPOSITORY");

export type CareerImportTarget = {
  userId: string;
  studentId: string;
  userName: string | null;
  alumniProfileId: string | null;
  existingCompanyNames: string[];
};

export type CareerImportBatchRowPersistenceInput = CareerImportPreviewRowDto & {
  rawValues: Record<string, string | number | null>;
  normalizedValues: NormalizedCareerImportValues | null;
};

export type CareerImportBatchPersistenceInput = {
  fileName: string;
  adminUserId: string;
  rows: CareerImportBatchRowPersistenceInput[];
};

export type CareerImportConfirmRow = {
  id: string;
  rowNumber: number;
  userId: string;
  normalizedValues: NormalizedCareerImportValues;
};

export type CareerImportBatchForConfirmation = {
  id: string;
  status: "PREVIEWED" | "CONFIRMED";
  totalCount: number;
  validCount: number;
  errorCount: number;
  pendingCount: number;
  rows: CareerImportConfirmRow[];
};

export interface CareerImportRepositoryPort {
  findTargetsByStudentIds(studentIds: string[]): Promise<Map<string, CareerImportTarget>>;
  createPreviewBatch(input: CareerImportBatchPersistenceInput): Promise<CareerImportPreviewDto>;
  findBatchForConfirmation(batchId: string): Promise<CareerImportBatchForConfirmation | null>;
  applyConfirmedRows(batchId: string, rows: CareerImportConfirmRow[]): Promise<number>;
}
