import { AlumniProfileDraft } from "./alumni-profile.entity";

describe("AlumniProfileDraft", () => {
  it("normalizes profile fields for update", () => {
    const draft = AlumniProfileDraft.create(
      {
        nickname: "  taro  ",
        companyNames: [" ACME ", "", "ACME", "Beta"],
        contactEmail: "  user@example.com ",
        xUrl: "  https://x.com/example  ",
        instagramUrl: " https://www.instagram.com/example/ ",
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
      xUrl: "https://x.com/example",
      instagramUrl: "https://www.instagram.com/example/",
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
        acceptContact: false,
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

  it("throws when social contact URLs point outside the selected platform", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "taro",
          companyNames: ["ACME"],
          xUrl: "https://example.com/messages",
          isPublic: true,
        },
        "fallback@example.com",
      ),
    ).toThrow("X contact URL must point to X");
  });

  it("throws when contact is accepted without a social contact URL", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "taro",
          companyNames: ["ACME"],
          isPublic: true,
          acceptContact: true,
        },
        "fallback@example.com",
      ),
    ).toThrow("xUrl or instagramUrl is required when acceptContact is true");
  });

  it("rejects offer as a selection step", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "taro",
          companyNames: [],
          companyExperiences: [
            {
              companyName: "ACME",
              selectionExperience: {
                steps: [
                  {
                    stepKind: "OFFER" as never,
                    questions: "内定",
                  },
                ],
              },
            },
          ],
          isPublic: true,
          acceptContact: false,
        },
        "fallback@example.com",
      ),
    ).toThrow("selection step kind is invalid");
  });
});
