import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma.service";
import { normalizeCompanyNameForSearch } from "../../alumni/domain/company-search-normalization";
import type {
  CareerImportPreviewDto,
  NormalizedCareerImportValues,
} from "../application/dto/career-import.dto";
import type {
  CareerImportBatchForConfirmation,
  CareerImportBatchPersistenceInput,
  CareerImportConfirmRow,
  CareerImportRepositoryPort,
  CareerImportTarget,
} from "../application/ports/career-import-repository.port";

type RawBatchRecord = {
  id: string;
  status: "PREVIEWED" | "CONFIRMED";
  totalCount: number;
  validCount: number;
  errorCount: number;
  pendingCount: number;
};

type RawRowRecord = {
  id: string;
  rowNumber: number;
  userId: string | null;
  normalizedValues: NormalizedCareerImportValues | string | null;
};

@Injectable()
export class CareerImportRepository implements CareerImportRepositoryPort {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findTargetsByStudentIds(studentIds: string[]): Promise<Map<string, CareerImportTarget>> {
    if (studentIds.length === 0) {
      return new Map();
    }

    const users = await this.prisma.user.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
      },
      select: {
        id: true,
        name: true,
        studentId: true,
        alumniProfile: {
          select: {
            id: true,
            companies: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    return new Map(
      users
        .filter((user) => user.studentId)
        .map((user) => [
          user.studentId as string,
          {
            userId: user.id,
            studentId: user.studentId as string,
            userName: user.name,
            alumniProfileId: user.alumniProfile?.id ?? null,
            existingCompanyNames:
              user.alumniProfile?.companies.map((company) => company.companyName) ?? [],
          },
        ]),
    );
  }

  async createPreviewBatch(
    input: CareerImportBatchPersistenceInput,
  ): Promise<CareerImportPreviewDto> {
    const batchId = randomUUID();
    const totalCount = input.rows.length;
    const validCount = input.rows.filter((row) => row.status === "VALID").length;
    const errorCount = input.rows.filter((row) => row.status === "ERROR").length;
    const pendingCount = input.rows.filter((row) => row.status === "PENDING_USER").length;
    const overwriteCount = input.rows.filter((row) => row.willOverwrite).length;

    await this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`
        INSERT INTO "CareerImportBatch" (
          "id",
          "fileName",
          "adminUserId",
          "status",
          "totalCount",
          "validCount",
          "errorCount",
          "pendingCount",
          "overwriteCount",
          "updatedAt"
        )
        VALUES (
          ${batchId},
          ${input.fileName},
          ${input.adminUserId},
          'PREVIEWED'::"CareerImportBatchStatus",
          ${totalCount},
          ${validCount},
          ${errorCount},
          ${pendingCount},
          ${overwriteCount},
          NOW()
        )
      `;

      for (const row of input.rows) {
        await transaction.$executeRaw`
          INSERT INTO "CareerImportRow" (
            "id",
            "batchId",
            "rowNumber",
            "status",
            "rawValues",
            "normalizedValues",
            "errors",
            "studentId",
            "companyName",
            "userId",
            "alumniProfileId",
            "willOverwrite"
          )
          VALUES (
            ${row.id},
            ${batchId},
            ${row.rowNumber},
            ${row.status}::"CareerImportRowStatus",
            ${JSON.stringify(row.rawValues)}::jsonb,
            ${row.normalizedValues ? JSON.stringify(row.normalizedValues) : null}::jsonb,
            ${row.errors},
            ${row.studentId},
            ${row.companyName},
            ${row.matchedUserId},
            ${row.matchedAlumniProfileId},
            ${row.willOverwrite}
          )
        `;
      }
    });

    return {
      batchId,
      fileName: input.fileName,
      totalCount,
      validCount,
      errorCount,
      pendingCount,
      overwriteCount,
      rows: input.rows.map(
        ({ rawValues: _rawValues, normalizedValues: _normalizedValues, ...row }) => row,
      ),
    };
  }

  async findBatchForConfirmation(
    batchId: string,
  ): Promise<CareerImportBatchForConfirmation | null> {
    const batches = await this.prisma.$queryRaw<RawBatchRecord[]>`
      SELECT
        "id",
        "status",
        "totalCount",
        "validCount",
        "errorCount",
        "pendingCount"
      FROM "CareerImportBatch"
      WHERE "id" = ${batchId}
      LIMIT 1
    `;
    const batch = batches[0];
    if (!batch) {
      return null;
    }

    const rows = await this.prisma.$queryRaw<RawRowRecord[]>`
      SELECT
        "id",
        "rowNumber",
        "userId",
        "normalizedValues"
      FROM "CareerImportRow"
      WHERE "batchId" = ${batchId}
        AND "status" = 'VALID'::"CareerImportRowStatus"
        AND "userId" IS NOT NULL
        AND "normalizedValues" IS NOT NULL
      ORDER BY "rowNumber" ASC
    `;

    return {
      ...batch,
      rows: rows.flatMap((row) => {
        if (!row.userId || !row.normalizedValues) {
          return [];
        }

        return [
          {
            id: row.id,
            rowNumber: row.rowNumber,
            userId: row.userId,
            normalizedValues: this.parseNormalizedValues(row.normalizedValues),
          },
        ];
      }),
    };
  }

  async applyConfirmedRows(batchId: string, rows: CareerImportConfirmRow[]): Promise<number> {
    if (rows.length === 0) {
      await this.markBatchConfirmed(batchId);
      return 0;
    }

    return this.prisma.$transaction(async (transaction) => {
      let appliedCount = 0;

      for (const row of rows) {
        const values = row.normalizedValues;
        const user = await transaction.user.findUnique({
          where: { id: row.userId },
          select: {
            id: true,
            name: true,
            alumniProfile: {
              select: { id: true },
            },
          },
        });

        if (!user) {
          continue;
        }

        if (!user.name?.trim()) {
          await transaction.user.update({
            where: { id: user.id },
            data: { name: values.fullName },
          });
        }

        const profile = user.alumniProfile
          ? await transaction.alumniProfile.update({
              where: { id: user.alumniProfile.id },
              data: {
                graduationYear: values.graduationYear,
                department: values.department,
                gakuchika: values.gakuchika,
                activityPeriod: values.activityPeriod,
              },
              select: { id: true },
            })
          : await transaction.alumniProfile.create({
              data: {
                userId: user.id,
                graduationYear: values.graduationYear,
                department: values.department,
                gakuchika: values.gakuchika,
                activityPeriod: values.activityPeriod,
                isPublic: false,
                acceptContact: false,
                skills: [],
              },
              select: { id: true },
            });

        await transaction.alumniCompany.upsert({
          where: {
            alumniProfileId_companyName: {
              alumniProfileId: profile.id,
              companyName: values.companyName,
            },
          },
          create: {
            alumniProfileId: profile.id,
            companyName: values.companyName,
            companyNameSearch: normalizeCompanyNameForSearch(values.companyName),
            isPublic: false,
            motivation: values.companyMotivation,
          },
          update: {
            companyNameSearch: normalizeCompanyNameForSearch(values.companyName),
            isPublic: false,
            motivation: values.companyMotivation,
          },
        });

        await transaction.$executeRaw`
          UPDATE "CareerImportRow"
          SET "alumniProfileId" = ${profile.id}
          WHERE "id" = ${row.id}
        `;

        appliedCount += 1;
      }

      await transaction.$executeRaw`
        UPDATE "CareerImportBatch"
        SET
          "status" = 'CONFIRMED'::"CareerImportBatchStatus",
          "confirmedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE "id" = ${batchId}
      `;

      return appliedCount;
    });
  }

  private async markBatchConfirmed(batchId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "CareerImportBatch"
      SET
        "status" = 'CONFIRMED'::"CareerImportBatchStatus",
        "confirmedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE "id" = ${batchId}
    `;
  }

  private parseNormalizedValues(
    values: NormalizedCareerImportValues | string,
  ): NormalizedCareerImportValues {
    if (typeof values === "string") {
      return JSON.parse(values) as NormalizedCareerImportValues;
    }

    return values;
  }
}
