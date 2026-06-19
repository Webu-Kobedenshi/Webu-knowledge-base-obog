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
        isPublic: false,
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
      isPublic: false,
      acceptContact: false,
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
            motivation: " 事業内容に惹かれた ",
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
        activityPeriod: "SECOND_YEAR_FIRST_HALF",
        activityPeriodNote: " 4月から説明会に参加 ",
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
          motivation: "事業内容に惹かれた",
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
      activityPeriod: "SECOND_YEAR_FIRST_HALF",
      activityPeriodNote: "4月から説明会に参加",
    });
  });

  it("keeps only questions for document screening steps", () => {
    const draft = AlumniProfileDraft.create(
      {
        nickname: "taro",
        companyNames: [],
        companyExperiences: [
          {
            companyName: "ACME",
            motivation: "事業内容に惹かれた",
            selectionExperience: {
              steps: [
                {
                  stepKind: "DOCUMENT_SCREENING",
                  format: "ONLINE",
                  interviewerCount: 1,
                  durationMinutes: 30,
                  questions: " 提出書類で確認されたこと ",
                  atmosphere: "不要な雰囲気",
                  preparation: "不要な準備",
                },
              ],
            },
          },
        ],
        activityPeriod: "SECOND_YEAR_FIRST_HALF",
        isPublic: true,
        acceptContact: false,
      },
      "fallback@example.com",
    );

    expect(draft.toData().companyExperiences?.[0]?.selectionExperience?.steps).toEqual([
      {
        stepKind: "DOCUMENT_SCREENING",
        format: "UNKNOWN",
        questions: "提出書類で確認されたこと",
      },
    ]);
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

  it("throws when isPublic=true without activity period", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "taro",
          companyNames: [],
          companyExperiences: [{ companyName: "ACME", motivation: "事業内容に惹かれた" }],
          isPublic: true,
        },
        "fallback@example.com",
      ),
    ).toThrow("activityPeriod is required when isPublic is true");
  });

  it("throws when isPublic=true without at least one public company motivation", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "taro",
          companyNames: [],
          companyExperiences: [{ companyName: "ACME", motivation: "   " }],
          activityPeriod: "SECOND_YEAR_FIRST_HALF",
          isPublic: true,
        },
        "fallback@example.com",
      ),
    ).toThrow("at least one public company motivation is required when isPublic is true");
  });

  it("throws when social contact URLs point outside the selected platform", () => {
    expect(() =>
      AlumniProfileDraft.create(
        {
          nickname: "taro",
          companyNames: [],
          companyExperiences: [{ companyName: "ACME", motivation: "事業内容に惹かれた" }],
          activityPeriod: "SECOND_YEAR_FIRST_HALF",
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
          companyNames: [],
          companyExperiences: [{ companyName: "ACME", motivation: "事業内容に惹かれた" }],
          activityPeriod: "SECOND_YEAR_FIRST_HALF",
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
