import { normalizeCareerImportRow } from "./career-import-normalizer";

describe("normalizeCareerImportRow", () => {
  it("normalizes Japanese department and activity period labels", () => {
    const result = normalizeCareerImportRow({
      rowNumber: 2,
      studentId: " 24A0001 ",
      fullName: " 山田 太郎 ",
      department: " ITエキスパート学科 ",
      graduationYear: "2027",
      companyName: " ACME ",
      companyMotivation: " 事業に惹かれた ",
      activityPeriod: "2年前期",
      gakuchika: " チーム開発 ",
      email: " student@example.com ",
      remarks: " memo ",
      consent: " yes ",
    });

    expect(result.errors).toEqual([]);
    expect(result.normalizedValues).toEqual({
      studentId: "24A0001",
      fullName: "山田 太郎",
      department: "IT_EXPERT",
      graduationYear: 2027,
      companyName: "ACME",
      companyMotivation: "事業に惹かれた",
      activityPeriod: "SECOND_YEAR_FIRST_HALF",
      gakuchika: "チーム開発",
      email: "student@example.com",
      remarks: "memo",
      consent: "yes",
    });
  });

  it("returns validation errors for missing and invalid values", () => {
    const result = normalizeCareerImportRow({
      rowNumber: 2,
      studentId: "",
      fullName: "",
      department: "存在しない学科",
      graduationYear: "abc",
      companyName: "",
      companyMotivation: "",
      activityPeriod: "3年後期",
      gakuchika: "",
    });

    expect(result.normalizedValues).toBeNull();
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "学籍番号 is required",
        "本名 is required",
        "内定先 is required",
        "学科 is invalid",
        "卒業年度 is invalid",
        "始めた就活時期 is invalid",
      ]),
    );
  });
});
