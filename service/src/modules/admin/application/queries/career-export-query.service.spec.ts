import type { CareerExportRepositoryPort } from "../ports/career-export-repository.port";
import { CareerExportQueryService } from "./career-export-query.service";

describe("CareerExportQueryService", () => {
  it("delegates export row lookup to repository", async () => {
    const rows = [
      {
        studentId: "24A0001",
        fullName: "山田 太郎",
        department: "IT_EXPERT",
        graduationYear: 2027,
        companyName: "ACME",
        companyMotivation: "事業に惹かれた",
        activityPeriod: "SECOND_YEAR_FIRST_HALF",
        gakuchika: "チーム開発",
      },
    ];
    const repo = {
      findCareerExportRows: jest.fn().mockResolvedValue(rows),
    } as unknown as CareerExportRepositoryPort;
    const service = new CareerExportQueryService(repo);

    await expect(service.getCareerExportRows()).resolves.toEqual(rows);
    expect(repo.findCareerExportRows).toHaveBeenCalledWith();
  });
});
