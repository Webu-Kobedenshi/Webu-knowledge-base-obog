import { BadRequestException } from "@nestjs/common";
import type { CareerImportRepositoryPort } from "../ports/career-import-repository.port";
import { CareerImportCommandService } from "./career-import-command.service";

describe("CareerImportCommandService", () => {
  const createService = () => {
    const repo = {
      findTargetsByStudentIds: jest.fn(),
      createPreviewBatch: jest.fn(),
      findBatchForConfirmation: jest.fn(),
      applyConfirmedRows: jest.fn(),
    } as unknown as CareerImportRepositoryPort;

    const service = new CareerImportCommandService(repo);
    return { service, repo };
  };

  const validRow = {
    rowNumber: 2,
    studentId: "24A0001",
    fullName: "山田 太郎",
    department: "IT_EXPERT",
    graduationYear: "2027",
    companyName: "ACME",
    companyMotivation: "事業に惹かれた",
    activityPeriod: "2年前期",
    gakuchika: "チーム開発",
  };

  it("creates preview rows with matched, pending, overwrite, and error statuses", async () => {
    const { service, repo } = createService();
    (repo.findTargetsByStudentIds as jest.Mock).mockResolvedValue(
      new Map([
        [
          "24A0001",
          {
            userId: "u1",
            studentId: "24A0001",
            userName: "山田 太郎",
            alumniProfileId: "p1",
            existingCompanyNames: ["ACME"],
          },
        ],
      ]),
    );
    (repo.createPreviewBatch as jest.Mock).mockImplementation(async (input) => ({
      batchId: "b1",
      fileName: input.fileName,
      totalCount: input.rows.length,
      validCount: input.rows.filter((row: { status: string }) => row.status === "VALID").length,
      errorCount: input.rows.filter((row: { status: string }) => row.status === "ERROR").length,
      pendingCount: input.rows.filter((row: { status: string }) => row.status === "PENDING_USER")
        .length,
      overwriteCount: input.rows.filter((row: { willOverwrite: boolean }) => row.willOverwrite)
        .length,
      rows: input.rows,
    }));

    const result = await service.previewCareerExcelImport("admin1", {
      fileName: "career.xlsx",
      rows: [
        validRow,
        { ...validRow, rowNumber: 3, studentId: "24A0002", companyName: "Beta" },
        { ...validRow, rowNumber: 4, studentId: "", companyName: "" },
      ],
    });

    expect(result.validCount).toBe(1);
    expect(result.pendingCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.overwriteCount).toBe(1);
  });

  it("marks duplicate student and company rows as errors", async () => {
    const { service, repo } = createService();
    (repo.findTargetsByStudentIds as jest.Mock).mockResolvedValue(new Map());
    (repo.createPreviewBatch as jest.Mock).mockImplementation(async (input) => ({
      batchId: "b1",
      fileName: input.fileName,
      totalCount: input.rows.length,
      validCount: 0,
      errorCount: input.rows.filter((row: { status: string }) => row.status === "ERROR").length,
      pendingCount: 0,
      overwriteCount: 0,
      rows: input.rows,
    }));

    const result = await service.previewCareerExcelImport("admin1", {
      fileName: "career.xlsx",
      rows: [validRow, { ...validRow, rowNumber: 3 }],
    });

    expect(result.errorCount).toBe(2);
    expect(result.rows[0].errors).toContain("同一ファイル内で学籍番号 + 内定先 が重複しています");
    expect(result.rows[1].errors).toContain("同一ファイル内で学籍番号 + 内定先 が重複しています");
  });

  it("rejects empty import rows", async () => {
    const { service } = createService();

    await expect(
      service.previewCareerExcelImport("admin1", {
        fileName: "career.xlsx",
        rows: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("confirms only valid matched rows", async () => {
    const { service, repo } = createService();
    (repo.findBatchForConfirmation as jest.Mock).mockResolvedValue({
      id: "b1",
      status: "PREVIEWED",
      totalCount: 3,
      validCount: 1,
      errorCount: 1,
      pendingCount: 1,
      rows: [{ id: "r1" }],
    });
    (repo.applyConfirmedRows as jest.Mock).mockResolvedValue(1);

    const result = await service.confirmCareerExcelImport("b1");

    expect(repo.applyConfirmedRows).toHaveBeenCalledWith("b1", [{ id: "r1" }]);
    expect(result).toEqual({
      batchId: "b1",
      totalCount: 3,
      appliedCount: 1,
      skippedCount: 2,
      pendingCount: 1,
      errorCount: 1,
    });
  });
});
