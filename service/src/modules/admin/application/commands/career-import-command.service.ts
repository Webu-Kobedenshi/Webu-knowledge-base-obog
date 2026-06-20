import { randomUUID } from "node:crypto";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { normalizeCareerImportRow } from "../../domain/career-import-normalizer";
import type {
  CareerExcelImportPreviewInput,
  CareerImportPreviewDto,
  CareerImportResultDto,
} from "../dto/career-import.dto";
import {
  CAREER_IMPORT_REPOSITORY,
  type CareerImportBatchRowPersistenceInput,
  type CareerImportRepositoryPort,
} from "../ports/career-import-repository.port";

const MAX_IMPORT_ROWS = 1000;

@Injectable()
export class CareerImportCommandService {
  constructor(
    @Inject(CAREER_IMPORT_REPOSITORY)
    private readonly careerImportRepository: CareerImportRepositoryPort,
  ) {}

  async previewCareerExcelImport(
    adminUserId: string,
    input: CareerExcelImportPreviewInput,
  ): Promise<CareerImportPreviewDto> {
    const fileName = input.fileName.trim();
    if (!fileName) {
      throw new BadRequestException("fileName is required");
    }

    if (input.rows.length === 0) {
      throw new BadRequestException("rows is required");
    }

    if (input.rows.length > MAX_IMPORT_ROWS) {
      throw new BadRequestException(`rows must be less than or equal to ${MAX_IMPORT_ROWS}`);
    }

    const normalizedRows = input.rows.map((row) => ({
      rowNumber: row.rowNumber,
      ...normalizeCareerImportRow(row),
    }));
    const duplicateKeys = this.findDuplicateKeys(
      normalizedRows.flatMap((row) =>
        row.normalizedValues
          ? [
              {
                rowNumber: row.rowNumber,
                key: `${row.normalizedValues.studentId}\u0000${row.normalizedValues.companyName}`,
              },
            ]
          : [],
      ),
    );
    const studentIds = [
      ...new Set(
        normalizedRows.flatMap((row) =>
          row.normalizedValues && !duplicateKeys.has(row.rowNumber)
            ? [row.normalizedValues.studentId]
            : [],
        ),
      ),
    ];
    const targets = await this.careerImportRepository.findTargetsByStudentIds(studentIds);

    const persistenceRows: CareerImportBatchRowPersistenceInput[] = normalizedRows.map((row) => {
      const errors = [...row.errors];
      if (duplicateKeys.has(row.rowNumber)) {
        errors.push("同一ファイル内で学籍番号 + 内定先 が重複しています");
      }

      const normalizedValues = errors.length === 0 ? row.normalizedValues : null;
      const target = normalizedValues ? targets.get(normalizedValues.studentId) : undefined;
      const status = errors.length > 0 ? "ERROR" : target ? "VALID" : "PENDING_USER";
      const willOverwrite = Boolean(
        normalizedValues &&
          target?.existingCompanyNames.some(
            (companyName) => companyName === normalizedValues.companyName,
          ),
      );

      return {
        id: randomUUID(),
        rowNumber: row.rowNumber,
        status,
        errors,
        rawValues: row.rawValues,
        normalizedValues,
        studentId: normalizedValues?.studentId ?? null,
        fullName: normalizedValues?.fullName ?? null,
        department: normalizedValues?.department ?? null,
        graduationYear: normalizedValues?.graduationYear ?? null,
        companyName: normalizedValues?.companyName ?? null,
        companyMotivation: normalizedValues?.companyMotivation ?? null,
        activityPeriod: normalizedValues?.activityPeriod ?? null,
        gakuchika: normalizedValues?.gakuchika ?? null,
        matchedUserId: target?.userId ?? null,
        matchedAlumniProfileId: target?.alumniProfileId ?? null,
        willOverwrite,
      };
    });

    return this.careerImportRepository.createPreviewBatch({
      fileName,
      adminUserId,
      rows: persistenceRows,
    });
  }

  async confirmCareerExcelImport(batchId: string): Promise<CareerImportResultDto> {
    const batch = await this.careerImportRepository.findBatchForConfirmation(batchId);
    if (!batch) {
      throw new NotFoundException("Career import batch not found");
    }

    if (batch.status !== "PREVIEWED") {
      throw new BadRequestException("Career import batch is already confirmed");
    }

    const appliedCount = await this.careerImportRepository.applyConfirmedRows(batch.id, batch.rows);

    return {
      batchId: batch.id,
      totalCount: batch.totalCount,
      appliedCount,
      skippedCount: batch.totalCount - appliedCount,
      pendingCount: batch.pendingCount,
      errorCount: batch.errorCount,
    };
  }

  private findDuplicateKeys(rows: Array<{ rowNumber: number; key: string }>): Set<number> {
    const firstRowByKey = new Map<string, number>();
    const duplicateRows = new Set<number>();

    for (const row of rows) {
      const firstRowNumber = firstRowByKey.get(row.key);
      if (firstRowNumber) {
        duplicateRows.add(firstRowNumber);
        duplicateRows.add(row.rowNumber);
        continue;
      }

      firstRowByKey.set(row.key, row.rowNumber);
    }

    return duplicateRows;
  }
}
