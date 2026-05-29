import { AlumniProfileDraft } from "./alumni-profile.entity";

describe("AlumniProfileDraft", () => {
  it("normalizes profile fields for update", () => {
    const draft = AlumniProfileDraft.create(
      {
        nickname: "  taro  ",
        companyNames: [" ACME ", "", "ACME", "Beta"],
        contactEmail: "  user@example.com ",
        isPublic: true,
        acceptContact: true,
        skills: [" React ", "Node", "React", "TypeScript"],
        portfolioUrl: "  https://example.com  ",
        gakuchika: "  project  ",
        usefulCoursework: "  coursework  ",
      },
      "fallback@example.com",
    );

    expect(draft.toData()).toEqual({
      nickname: "taro",
      companyNames: ["ACME", "Beta"],
      companyExperiences: undefined,
      contactEmail: "user@example.com",
      isPublic: true,
      acceptContact: true,
      skills: ["React", "Node", "TypeScript"],
      portfolioUrl: "https://example.com",
      gakuchika: "project",
      usefulCoursework: "coursework",
    });
  });

  it("normalizes optional company selection experiences", () => {
    const draft = AlumniProfileDraft.create(
      {
        nickname: "taro",
        companyNames: [],
        companyExperiences: [
          {
            companyName: " ACME ",
            selectionExperience: {
              entryTrigger: " 学校求人 ",
              overallTip: " 落ち着いて話す ",
              steps: [
                {
                  stepKind: "FIRST_INTERVIEW",
                  format: "ONLINE",
                  interviewerCount: 2,
                  durationMinutes: 30,
                  questions: " 志望動機 ",
                },
              ],
            },
          },
        ],
        isPublic: true,
      },
      "fallback@example.com",
    );

    expect(draft.toData()).toMatchObject({
      companyNames: ["ACME"],
      companyExperiences: [
        {
          companyName: "ACME",
          selectionExperience: {
            entryTrigger: "学校求人",
            overallTip: "落ち着いて話す",
            steps: [
              {
                stepKind: "FIRST_INTERVIEW",
                format: "ONLINE",
                interviewerCount: 2,
                durationMinutes: 30,
                questions: "志望動機",
              },
            ],
          },
        },
      ],
    });
  });

  it("throws when isPublic=true without nickname", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "   ",
          companyNames: ["ACME"],
          isPublic: true,
        },
        "fallback@example.com",
      ),
    ).toThrow("nickname is required when isPublic is true");
  });
});
